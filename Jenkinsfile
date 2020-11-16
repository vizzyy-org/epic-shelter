#! groovy

currentBuild.displayName = "Epic-Shelter [$currentBuild.number]"

String serviceName = "epic-shelter"
String commitHash = ""
Boolean deploymentCheckpoint = false
GString startContainerCommand = "docker run --log-driver=journald \
--log-opt tag=$serviceName \
--restart always \
-d -p 443:443 \
-v /etc/pki/vizzyy:/etc/pki/vizzyy:ro \
--name $serviceName vizzyy/$serviceName:"

try {
    if (ISSUE_NUMBER)
        echo "Building from pull request..."
} catch (Exception ignored) {
    ISSUE_NUMBER = false
    echo "Building from jenkins job..."
}

pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr:'10'))
        disableConcurrentBuilds()
        quietPeriod(1)
        timestamps()
    }
    parameters {
        booleanParam(name: 'Build', defaultValue: true, description: 'Build latest artifact')
        booleanParam(name: 'Deploy', defaultValue: true, description: 'Deploy latest artifact')
        booleanParam(name: 'Test', defaultValue: true, description: 'Run test suite')
    }
    stages {
        stage("Acknowledge") {
            when {
                expression {
                    return env.Build == "true" && ISSUE_NUMBER
                }
            }
            steps {
                script {
                    prTools.comment(ISSUE_NUMBER,
                            """{
                                "body": "Jenkins triggered $currentBuild.displayName"
                            }""",
                            serviceName)
                }
            }
        }

        stage("Checkout") {
            steps {
                script {
                    prTools.checkoutBranch(ISSUE_NUMBER, "vizzyy/$serviceName")
                    commitHash = env.GIT_COMMIT.substring(0,7)
                }
            }
        }

        stage("Build") {
            when {
                expression {
                    return env.Build == "true"
                }
            }
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'Node 14.X') {
                        sh("""
                            npm i --silent
                            docker build --squash -t vizzyy/$serviceName:${commitHash} . --network=host;
                        """)
                    }
                }
            }
        }

        stage("Test") {
            when {
                expression {
                    return env.Test == "true"
                }
            }
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'Node 14.X') {
                        echo 'Running Mocha Tests...'
                        rc = sh(script: "npm run coverage", returnStatus: true)

                        if (rc != 0) {
                            sh """
                                docker rm $serviceName;
                                docker rmi -f \$(docker images -a -q);
                            """
                            error("Mocha tests failed!")
                        }
                    }
                }
            }
        }

        stage("Deploy") {
            when {
                expression {
                    return env.Deploy == "true"
                }
            }
            steps {
                script {
                    sh("""
                        docker tag vizzyy/$serviceName:${commitHash} vizzyy/$serviceName:${commitHash};
                        docker push vizzyy/$serviceName:${commitHash};
                    """)
                }
            }
        }

        stage("Start") {
            when {
                expression {
                    return env.Deploy == "true"
                }
            }
            steps {
                script {
                    deploymentCheckpoint = true;
                    def cmd = """
                        docker stop $serviceName;
                        docker rm $serviceName;
                        docker images -a | grep '$serviceName' | awk '{print \\\$3}' | xargs docker rmi;
                        $startContainerCommand$commitHash
                    """
                    withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
                        sh("""ssh -i ~/ec2pair.pem ec2-user@$host "$cmd" """)
                    }
                }
            }
        }

        stage("Confirm") {
            when {
                expression {
                    return env.Deploy == "true"
                }
            }
            steps {
                script {
                    Boolean deployed = false
                    withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host'),
                                     string(credentialsId: 'KEYSTORE_PASS', variable: 'pw')]) {
                        for (int i = 0; i < 12; i++) {

                            try {
                                def health = sh(
                                        script: "curl -k --cert-type P12 --cert ~/client_keypair.p12:$pw https://www.$host/",
                                        returnStdout: true
                                ).trim()
                                echo health
                                if (health.contains("<title>Home</title>")) {
                                    deployed = true
                                    break
                                }
                            } catch (Exception e) {
                                echo "Could not parse health check response."
                                e.printStackTrace()
                            }

                            sleep time: i, unit: 'SECONDS'

                        }

                        if (!deployed)
                            error("Failed to deploy.")

                    }
                }
            }
        }
    }
    post {
        always {
            publishCoverage adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')]
        }
        success {
            script {
                if (env.Build == "true" && ISSUE_NUMBER) {
                    prTools.merge(ISSUE_NUMBER,
                            """{
                                "commit_title": "Jenkins merged $currentBuild.displayName",
                                "merge_method": "merge"
                            }""",
                            serviceName)
                    prTools.comment(ISSUE_NUMBER,
                            """{
                                "body": "Jenkins successfully deployed $currentBuild.displayName"
                            }""",
                            serviceName)
                }
                sh "echo '${env.GIT_COMMIT}' > ~/userContent/$serviceName-last-success-hash.txt"
            }
        }
        failure {
            script {
                if (env.Build == "true" && ISSUE_NUMBER) {
                    prTools.comment(ISSUE_NUMBER,
                            """{
                                "body": "Jenkins failed during $currentBuild.displayName"
                            }""",
                            serviceName)
                }
                if(deploymentCheckpoint) { // don't restart instance on failure if no deployment occured
                    commitHash = sh(script: "cat ~/userContent/$serviceName-last-success-hash.txt", returnStdout: true)
                    commitHash = commitHash.substring(0, 7)
                    echo "Rolling back to previous successful image. Hash: $commitHash"
                    def cmd = """
                            docker stop $serviceName;
                            docker rm $serviceName;
                            docker images -a | grep '$serviceName' | awk '{print \\\$3}' | xargs docker rmi;
                            $startContainerCommand$commitHash
                        """
                    withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
                        sh("""ssh -i ~/ec2pair.pem ec2-user@$host "$cmd" """)
                    }
                }
            }
        }
        cleanup { // Cleanup post-flow always executes last
            deleteDir()
        }
    }
}