#! groovy

currentBuild.displayName = "Epic-Shelter [$currentBuild.number]"

String serviceName = "epic-shelter"
String nodeVersion = ""
String commitHash = ""
boolean deploymentCheckpoint = false
boolean rollback = false
String instance = ""
int instances = 2
GString startContainerCommand = "docker run --env NODE_ENV=production --log-driver=journald \
--log-opt tag=$serviceName \
--restart always \
-d -p 500$instance:443 \
--name $serviceName$instance vizzyy/$serviceName:"

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
                    nodeVersion = sh(script: "cat .nvmrc", returnStdout: true)
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
                    nodejs(nodeJSInstallationName: "Node $nodeVersion") {
                        // run npm outdated just to have an audit of what can be upgraded
                        sh("""
                            npm i --silent
                            npm outdated
                            docker build --build-arg NODE_VERSION=$nodeVersion --squash -t vizzyy/$serviceName:${commitHash} -t vizzyy/$serviceName:latest . --network=host;
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
                    nodejs(nodeJSInstallationName: "Node $nodeVersion") {
                        echo 'Running Mocha Tests...'
                        rc = sh(script: "NODE_ENV=test npm run coverage", returnStatus: true)

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

        stage("Push") {
            when {
                expression {
                    return env.Deploy == "true"
                }
            }
            steps {
                script {
                    sh("""
                        docker push vizzyy/$serviceName:${commitHash};
                        docker push vizzyy/$serviceName:latest;
                    """)
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
                    deploymentCheckpoint = true;
                    for (int i = 1; i <= instances; i++) {
                        instance = "$i"
                        echo "Deploying instance #$instance"
                        def cmd = """
                            docker stop $serviceName$instance;
                            docker rm $serviceName$instance;
                            $startContainerCommand$commitHash
                        """
                        withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
                            sh("ssh -i ~/ec2pair.pem ec2-user@$host '$cmd'")
                        }
                        sleep time: 10, unit: 'SECONDS'
                    }

                    String remove_excess_images = "docker rmi -f \$(docker images -a -q);"
                    withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
                        sh("ssh -i ~/ec2pair.pem ec2-user@$host '$remove_excess_images'")
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
                    rollback = !confirmDeployed()
                }
            }
        }

        stage("Rollback") {
            when {
                expression {
                    return rollback
                }
            }
            steps {
                script {
//                    if(deploymentCheckpoint) { // don't restart instance on failure if no deployment occured
//                        commitHash = sh(script: "cat ~/userContent/$serviceName-last-success-hash.txt", returnStdout: true)
//                        commitHash = commitHash.substring(0, 7)
//                        echo "Rolling back to previous successful image. Hash: $commitHash"
//                        def cmd = """
//                            docker stop $serviceName;
//                            docker rm $serviceName;
//                            docker rmi -f \$(docker images -a -q);
//                            $startContainerCommand$commitHash
//                        """
//                        withCredentials([string(credentialsId: 'MAIN_SITE_HOST', variable: 'host')]) {
//                            sh("ssh -i ~/ec2pair.pem ec2-user@$host '$cmd'")
//                        }
//                    }
//
//                    if(confirmDeployed()){
//                        echo "ROLLBACK SUCCESS"
//                    } else {
//                        error("ROLLBACK FAILURE")
//                    }
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
                echo "SUCCESS"
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
                echo "FAILURE"
            }
        }
        cleanup { // Cleanup post-flow always executes last
            deleteDir()
        }
    }
}

boolean confirmDeployed(){
    boolean deployed = false
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

        if (!deployed) {
            echo "FAILED TO DEPLOY!"
        }

        return deployed
    }
}