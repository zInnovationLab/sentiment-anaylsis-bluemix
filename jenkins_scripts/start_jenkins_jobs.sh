#!/bin/bash

export REGISTRY=129.40.45.9
export REGISTRY_PORT=5000
export USR_NAME=lzh
export SLAVE_DOCKER_DAEMON_DIRECTORY=/data/docker
export SERVER_DOCKER_DAEMON_DIRECTORY=/localbox/lei/docker
export SLAVE=148.100.106.116
export GIT_URL=git@github.rtp.raleigh.ibm.com:lzhang-ca/sentiment-analysis-blumix-zSupport.git

create_push_job ()
{
cd /localbox/lei/demo_elton/jenkins/war/target/jenkins/WEB-INF
/bin/cat <<EOF | java -jar jenkins-cli.jar -s http://lozlnxi:8080/jenkins create-job senti-bluemix-jenkins-push
<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>Fetch source code from gitlab, build on the jenkins server, push images to the registry.</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>BUILD_ID</name>
          <description></description>
          <defaultValue>dontKillMe</defaultValue>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@2.4.4">
    <configVersion>2</configVersion>
    <userRemoteConfigs>
      <hudson.plugins.git.UserRemoteConfig>
        <url>${GIT_URL}</url>
      </hudson.plugins.git.UserRemoteConfig>
    </userRemoteConfigs>
    <branches>
      <hudson.plugins.git.BranchSpec>
        <name>*/master</name>
      </hudson.plugins.git.BranchSpec>
    </branches>
    <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
    <submoduleCfg class="list"/>
    <extensions/>
  </scm>
  <assignedNode>master</assignedNode>
  <canRoam>false</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers>
    <com.dabsquared.gitlabjenkins.GitLabPushTrigger plugin="gitlab-plugin@1.1.32">
      <spec></spec>
      <triggerOnPush>true</triggerOnPush>
      <triggerOnMergeRequest>true</triggerOnMergeRequest>
      <triggerOpenMergeRequestOnPush>never</triggerOpenMergeRequestOnPush>
      <ciSkip>true</ciSkip>
      <setBuildDescription>true</setBuildDescription>
      <addNoteOnMergeRequest>true</addNoteOnMergeRequest>
      <addCiMessage>false</addCiMessage>
      <addVoteOnMergeRequest>true</addVoteOnMergeRequest>
      <branchFilterName></branchFilterName>
      <includeBranchesSpec></includeBranchesSpec>
      <excludeBranchesSpec></excludeBranchesSpec>
      <targetBranchRegex></targetBranchRegex>
      <acceptMergeRequestOnSuccess>false</acceptMergeRequestOnSuccess>
    </com.dabsquared.gitlabjenkins.GitLabPushTrigger>
  </triggers>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>export REGISTRY=${REGISTRY}
export REGISTRY_PORT=${REGISTRY_PORT}
export USR_NAME=${USR_NAME}
export DOCKER_DAEMON_DIRECTORY=${SERVER_DOCKER_DAEMON_DIRECTORY}

./scripts/share/setup_docker.sh
cd scripts/jenkins_server
./setup_base_images.sh
docker-compose build
./push_images.sh</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers>
    <hudson.tasks.BuildTrigger>
      <childProjects>senti-bluemix-jenkins-pull</childProjects>
      <threshold>
        <name>SUCCESS</name>
        <ordinal>0</ordinal>
        <color>BLUE</color>
        <completeBuild>true</completeBuild>
      </threshold>
    </hudson.tasks.BuildTrigger>
  </publishers>
  <buildWrappers/>
</project>
EOF
cd -
}

create_pull_job ()
{
cd /localbox/lei/demo_elton/jenkins/war/target/jenkins/WEB-INF
/bin/cat <<EOF | java -jar jenkins-cli.jar -s http://lozlnxi:8080/jenkins create-job senti-bluemix-jenkins-pull
<?xml version='1.0' encoding='UTF-8'?>
<project>
  <actions/>
  <description>Fetch images from the registry, docker compose and run the containers.</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>BUILD_ID</name>
          <description></description>
          <defaultValue>dontKillMe</defaultValue>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <scm class="hudson.plugins.git.GitSCM" plugin="git@2.4.4">
    <configVersion>2</configVersion>
    <userRemoteConfigs>
      <hudson.plugins.git.UserRemoteConfig>
        <url>${GIT_URL}</url>
      </hudson.plugins.git.UserRemoteConfig>
    </userRemoteConfigs>
    <branches>
      <hudson.plugins.git.BranchSpec>
        <name>*/master</name>
      </hudson.plugins.git.BranchSpec>
    </branches>
    <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
    <submoduleCfg class="list"/>
    <extensions/>
  </scm>
  <assignedNode>${SLAVE}</assignedNode>
  <canRoam>false</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers/>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>export REGISTRY=${REGISTRY}
export REGISTRY_PORT=${REGISTRY_PORT}
export USR_NAME=${USR_NAME}
export DOCKER_DAEMON_DIRECTORY=${SLAVE_DOCKER_DAEMON_DIRECTORY}

./scripts/share/setup_docker.sh
cd scripts/jenkins_slave
./pull_images.sh
docker-compose up -d

</command>
    </hudson.tasks.Shell>
  </builders>
  <publishers/>
  <buildWrappers/>
</project>
EOF
cd -
}

create_push_job
create_pull_job
cd /localbox/lei/demo_elton/jenkins/war/target/jenkins/WEB-INF 
java -jar jenkins-cli.jar -s http://lozlnxi:8080/jenkins build senti-bluemix-jenkins-push
