#! groovy

currentBuild.displayName = "Epic-Shelter [ " + currentBuild.number + " ]"

String serviceName = "epic-shelter"
String commitHash = ""
GString startContainerCommand = "docker run --log-driver=journald \
--log-opt tag=$serviceName \
--restart always \
-d -p 443:443 \
-v /etc/pki/vizzyy:/etc/pki/vizzyy:ro \
--name $serviceName vizzyy/$serviceName:"

try {
    if (ISSUE_NUMBER)
        echo "Building from pull request..."
} catch (Exception e) {
    ISSUE_NUMBER = false
    echo "Building from jenkins job..."
}

pipeline {
    agent any
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
                                docker build -t vizzyy/$serviceName:${commitHash} . --network=host;
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
                    publishCoverage adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')]
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

                        def cmd = """
                            docker stop $serviceName; 
                            docker rm $serviceName;
                            docker rmi -f \$(docker images -a -q);
                            $startContainerCommand$commitHash
                        """
                        sh("ssh -i ~/ec2pair.pem ec2-user@$env.host '$cmd'")

                    }
                }
            }
        }

        stage("Confirm") {
            steps {
                script {
                    if (env.Deploy == "true") {

                        Boolean deployed = false
                        for(int i=0; i<12; i++){

                            try {
                                def health = sh (
                                        script: "curl -k https://www.$env.host/",
                                        returnStdout: true
                                ).trim()
                                echo health
                                if (health == "Found. Redirecting to /login"){
                                    deployed = true
                                    break
                                }
                            } catch ( Exception e) {
                                echo "Could not parse health check response."
                                e.printStackTrace()
                            }

                            sleep time: i, unit: 'SECONDS'

                        }

                        if(!deployed)
                            error("Failed to deploy.")

                    }
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts 'coverage/cobertura-coverage.xml'
            cobertura coberturaReportFile: 'coverage/cobertura-coverage.xml'
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
                commitHash = sh(script: "cat ~/userContent/$serviceName-last-success-hash.txt", returnStdout: true)
                commitHash = commitHash.substring(0,7)
                echo "Rolling back to previous successful image. Hash: $commitHash"
                def cmd = """
                            docker stop $serviceName; 
                            docker rm $serviceName;
                            docker rmi -f \$(docker images -a -q);
                            $startContainerCommand$commitHash
                        """
                sh("ssh -i ~/ec2pair.pem ec2-user@$env.host '$cmd'")
            }
        }
        cleanup { // Cleanup post-flow always executes last
            deleteDir()
        }
    }
}