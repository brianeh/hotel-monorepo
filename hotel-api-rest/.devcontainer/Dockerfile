FROM ubuntu:20.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies (excluding ant to avoid OpenJDK 11)
RUN apt-get update && \
    mkdir -p /usr/share/man/man1 && \
    apt-get install -y \
    openjdk-8-jdk \
    mysql-server \
    curl \
    wget \
    git \
    vim \
    sudo \
    gnupg \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Apache Ant manually to avoid OpenJDK 11 dependency
RUN cd /opt && \
    wget -q https://archive.apache.org/dist/ant/binaries/apache-ant-1.10.7-bin.tar.gz && \
    tar -xzf apache-ant-1.10.7-bin.tar.gz && \
    rm apache-ant-1.10.7-bin.tar.gz && \
    ln -s /opt/apache-ant-1.10.7/bin/ant /usr/local/bin/ant

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install GlassFish 4.1.1
RUN cd /opt && \
    wget -q https://download.oracle.com/glassfish/4.1.1/release/glassfish-4.1.1.zip && \
    unzip -q glassfish-4.1.1.zip && \
    rm glassfish-4.1.1.zip && \
    rm -rf /opt/glassfish4/glassfish/domains/domain1/osgi-cache/*

# Create vscode user
RUN useradd -m -s /bin/bash vscode && \
    echo 'vscode ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Install Jackson JAXB annotations module for GlassFish to support JSON deserialization
RUN cd /opt/glassfish4/glassfish/modules && \
    wget -q https://repo1.maven.org/maven2/com/fasterxml/jackson/module/jackson-module-jaxb-annotations/2.5.1/jackson-module-jaxb-annotations-2.5.1.jar

# Set GlassFish ownership to vscode user
RUN chown -R vscode:vscode /opt/glassfish4

# Download required JAR dependencies
RUN mkdir -p /opt/lib && \
    cd /opt/lib && \
    wget -q https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.16/mysql-connector-java-8.0.16.jar && \
    wget -q https://repo1.maven.org/maven2/javax/servlet/jstl/1.2/jstl-1.2.jar && \
    wget -q https://repo1.maven.org/maven2/commons-codec/commons-codec/1.7/commons-codec-1.7.jar && \
    chown -R vscode:vscode /opt/lib

# Install MySQL driver in GlassFish
RUN cp /opt/lib/mysql-connector-java-8.0.16.jar /opt/glassfish4/glassfish/lib/

# Create custom CopyLibs JAR with simplified copyfiles task implementation
RUN mkdir -p /tmp/copylibs/org/netbeans/modules/java/j2seproject/copylibstask && \
    cd /tmp/copylibs && \
    echo "Manifest-Version: 1.0" > MANIFEST.MF && \
    echo '<?xml version="1.0" encoding="UTF-8"?>' > org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '<antlib>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '    <macrodef name="copyfiles">' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '        <attribute name="files"/>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '        <attribute name="todir"/>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '        <attribute name="iftldtodir" default=""/>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '        <sequential>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '            <copy todir="@{todir}" flatten="true" failonerror="false">' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '                <path><pathelement path="@{files}"/></path>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '            </copy>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '        </sequential>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '    </macrodef>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    echo '</antlib>' >> org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml && \
    jar cvfm /opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar MANIFEST.MF org >/dev/null 2>&1 && \
    cd / && \
    rm -rf /tmp/copylibs && \
    chown vscode:vscode /opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar

# Create build property files with correct paths
RUN mkdir -p /tmp/build-properties && \
    echo "j2ee.server.home=/opt/glassfish4/glassfish" > /tmp/build-properties/ejb.properties && \
    echo "j2ee.server.middleware=/opt/glassfish4" >> /tmp/build-properties/ejb.properties && \
    echo "file.reference.mysql-connector-java-8.0.16.jar=/opt/lib/mysql-connector-java-8.0.16.jar" >> /tmp/build-properties/ejb.properties && \
    echo "libs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar" >> /tmp/build-properties/ejb.properties && \
    echo "j2ee.server.home=/opt/glassfish4/glassfish" > /tmp/build-properties/war.properties && \
    echo "j2ee.server.middleware=/opt/glassfish4" >> /tmp/build-properties/war.properties && \
    echo "file.reference.commons-codec-1.7.jar=/opt/lib/commons-codec-1.7.jar" >> /tmp/build-properties/war.properties && \
    echo "file.reference.jstl-1.2.jar=/opt/lib/jstl-1.2.jar" >> /tmp/build-properties/war.properties && \
    echo "libs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar" >> /tmp/build-properties/war.properties && \
    echo "j2ee.server.home=/opt/glassfish4/glassfish" > /tmp/build-properties/root.properties && \
    echo "j2ee.server.middleware=/opt/glassfish4" >> /tmp/build-properties/root.properties && \
    echo "libs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar" >> /tmp/build-properties/root.properties && \
    chown -R vscode:vscode /tmp/build-properties

# Set JAVA_HOME, GLASSFISH_HOME, ANT_HOME and PATH
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-arm64
ENV GLASSFISH_HOME=/opt/glassfish4
ENV ANT_HOME=/opt/apache-ant-1.10.7
ENV PATH=$JAVA_HOME/bin:$GLASSFISH_HOME/bin:$ANT_HOME/bin:$PATH

# SQL file will be copied in postCreateCommand to handle dev container features

# Set working directory
WORKDIR /workspace

# Switch to vscode user
USER vscode

# Check Java version
RUN java -version