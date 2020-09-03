#! groovy
import java.security.InvalidParameterException
import java.util.logging.Logger

Logger logger = Logger.getLogger('vizzyy.jenkins.deploy')
currentBuild.displayName = "Epic-Shelter [ " + currentBuild.number + " ]"

String commitHash = "";

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
                        prTools.comment(ISSUE_NUMBER, """{"body": "Jenkins triggered $currentBuild.displayName"}""", "epic-shelter")
                    }
                }
            }
        }

        stage("Build") {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'Node 11.X') {
                        prTools.checkoutBranch(ISSUE_NUMBER, "vizzyy/epic-shelter")

                        if (env.Build == "true") {
                            sh 'npm config ls'
                            if (env.DeleteNodeModules == "true") {
                                sh "rm -rf node_modules"
                            }
                            commitHash = env.GIT_COMMIT.substring(0,7)
                            sh("""
                                npm i --silent
                                docker build -t vizzyy/epic-shelter:${commitHash} . --network=host;
                            """)
                        }
                    }
                }
            }
        }

        stage("Test") {
            steps {
                script {
                    nodejs(nodeJSInstallationName: 'Node 11.X') {
                        if (env.Test == "true") {

                            echo 'Running Mocha Tests...'
                            rc = sh(script: "npm test", returnStatus: true)

                            if (rc != 0) {
                                sh """
                                    docker rm epic-shelter;
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
                            docker tag vizzyy/epic-shelter:${commitHash} vizzyy/epic-shelter:${commitHash};
                            docker push vizzyy/epic-shelter:${commitHash};
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
                            docker stop epic-shelter; 
                            docker rm epic-shelter;
                            docker container prune -f;
                            docker run --log-driver=journald --log-opt tag=epic-shelter -d -p 443:443 -v /etc/pki/vizzyy:/etc/pki/vizzyy:ro --name epic-shelter vizzyy/epic-shelter:${commitHash}
                        """
                        sh("""
                            ssh -i ~/ec2pair.pem ec2-user@vizzyy.com '$cmd'
                        """)

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
                                        script: 'curl -k https://www.vizzyy.com/',
                                        returnStdout: true
                                ).trim()
                                echo health
                                if (health == "Found. Redirecting to /login"){
                                    deployed = true
                                    break
                                }
                            } catch ( Exception e) {
                                echo "could not parse"
                                e.printStackTrace()
                            }

                            sleep time: i, unit: 'SECONDS'

                        }

                        if(!deployed)
                            throw new InvalidParameterException()

                    }
                }
            }
        }
    }
    post {
        success {
            script {
                if (env.Build == "true" && ISSUE_NUMBER) {
                    prTools.merge(ISSUE_NUMBER, """{"commit_title": "Jenkins merged $currentBuild.displayName","merge_method": "merge"}""", "spring_react")
                    prTools.comment(ISSUE_NUMBER, """{"body": "Jenkins successfully deployed $currentBuild.displayName"}""", "spring_react")
                }
                sh "echo '${env.GIT_COMMIT}' > ~/userContent/epic-shelter-last-success-hash.txt"
            }
        }
        failure {
            script {
                if (env.Build == "true" && ISSUE_NUMBER) {
                    prTools.comment(ISSUE_NUMBER, """{"body": "Jenkins failed during $currentBuild.displayName"}""", "spring_react")
                }
                commitHash = sh(script: "cat ~/userContent/epic-shelter-last-success-hash.txt", returnStdout: true)
                commitHash = commitHash.substring(0,7)
                echo "Rolling back to previous successful image. Hash: $commitHash"
                def cmd = """
                            docker stop epic-shelter; 
                            docker rm epic-shelter;
                            docker container prune -f;
                            docker run --log-driver=journald --log-opt tag=epic-shelter -d -p 443:443 -v /etc/pki/vizzyy:/etc/pki/vizzyy:ro --name epic-shelter vizzyy/epic-shelter:${commitHash}
                        """
                sh("""
                    ssh -i ~/ec2pair.pem ec2-user@vizzyy.com '$cmd'
                """)
            }
        }
    }
}