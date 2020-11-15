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
            steps {
                script {
                    if (env.Build == "true" && ISSUE_NUMBER) {
                        prTools.comment(ISSUE_NUMBER,
                                """{
                                    "body": "Jenkins triggered $currentBuild.displayName"
                                }""",
                                serviceName)
                    }
                }
            }
        }

        stage("Build") {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'Node 14.X') {
                        prTools.checkoutBranch(ISSUE_NUMBER, "vizzyy/$serviceName")

                        if (env.Build == "true") {
                            commitHash = env.GIT_COMMIT.substring(0,7)
                            sh("""
                                npm i --silent
                                docker build --squash -t vizzyy/$serviceName:${commitHash} . --network=host;
                            """)
                        }
                    }
                }
            }
        }

        stage("Test") {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'Node 14.X') {
                        if (env.Test == "true") {

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
        }

        stage("Deploy") {
            steps {
                script {
                    if (env.Deploy == "true") {

                        sh("""
                            docker tag vizzyy/$serviceName:${commitHash} vizzyy/$serviceName:${commitHash};
                            docker push vizzyy/$serviceName:${commitHash};
                        """)

                    }
                }
            }
        }

        stage("Start") {
            steps {
                script {
                    if (env.Deploy == "true") {
                        deploymentCheckpoint = true;
                        // docker rmi -f \$(docker images -a -q);
                        def cmd = """
                            docker stop $serviceName;
                            docker rm $serviceName;
                            $startContainerCommand$commitHash
                        """
                        withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
                            sh("ssh -i ~/ec2pair.pem ec2-user@$host '$cmd'")
                        }

                    }
                }
            }
        }

        stage("Confirm") {
            steps {
                script {
                    if (env.Deploy == "true") {

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
                            docker rmi -f \$(docker images -a -q);
                            $startContainerCommand$commitHash
                        """
                    withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
                        sh("ssh -i ~/ec2pair.pem ec2-user@$host '$cmd'")
                    }
                }
            }
        }
        cleanup { // Cleanup post-flow always executes last
            deleteDir()
        }
    }
}