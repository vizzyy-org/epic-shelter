#! groovy
import java.security.InvalidParameterException
import java.util.logging.Logger

Logger logger = Logger.getLogger('vizzyy.jenkins.deploy')
currentBuild.displayName = "Epic-Shelter [ " + currentBuild.number + " ]"


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
                    if (env.Build == "true") {
                        prTools.checkoutBranch(ISSUE_NUMBER, "vizzyy/epic-shelter")

                        sh('''
                            rm -rf node_modules
                            docker build -t vizzyy/epic-shelter:latest . --network=host;
                            docker tag vizzyy/epic-shelter:latest vizzyy/epic-shelter:latest;
                            docker push vizzyy/epic-shelter:latest
                        ''')
                    }
                }
            }
        }

        stage("Test") {
            steps {
                script {
                    if (env.Test == "true") {

                        echo 'Running Mocha Tests...'
                        rc = sh(script: "npm test", returnStatus: true)

                        if (rc != 0) {
                            echo "Tests Failed!"
                            throw new InvalidParameterException()
                        }
                    }
                }
            }
        }

        stage("Deploy") {
            steps {
                script {
                    if (env.Deploy == "true") {

                        //ec2 can only be ssh'd through jumpbox
                        sh("""
                            ssh -i ~/ec2pair.pem ec2-user@vizzyy.com 'docker stop epic-shelter; docker rm epic-shelter; docker rmi -f \$(docker images -a -q); docker pull vizzyy/epic-shelter:latest'
                        """)

                    }
                }
            }
        }

        stage("Start") {
            steps {
                script {
                    if (env.Deploy == "true") {

                        sh('''
                            ssh -i ~/ec2pair.pem ec2-user@vizzyy.com 'docker run --log-driver=journald --log-opt tag=epic-shelter -d -p 443:443 -v /etc/pki/vizzyy:/etc/pki/vizzyy:ro --name epic-shelter vizzyy/epic-shelter:latest'
                        ''')

                    }
                }
            }
        }

        stage("Confirm") {
            steps {
                script {
                    if (env.Deploy == "true") {

                        def deployed = false
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
            }
        }
        failure {
            script {
                if (env.Build == "true" && ISSUE_NUMBER) {
                    prTools.comment(ISSUE_NUMBER, """{"body": "Jenkins failed during $currentBuild.displayName"}""", "spring_react")
                }
            }
        }
    }
}