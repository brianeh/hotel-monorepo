#!/bin/bash

# Hotel Reservation Build Script
# This script sets up the necessary environment variables for building the NetBeans project

# Set the required properties for the build
export ANT_OPTS="-Dlibs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar -Dj2ee.server.home=/opt/glassfish4/glassfish"

# Run the ant command with the provided arguments
ant "$@"
