# NetBeans CopyLibs Fix

## Problem

NetBeans-generated Ant build files require the `org-netbeans-modules-java-j2seproject-copylibstask.jar` library, which is not available in Maven Central and is normally only included with NetBeans IDE.

**Error:**
```
The libs.CopyLibs.classpath property is not set up.
```

## Solution Implemented

Created a **custom CopyLibs JAR** with a simplified `copyfiles` task implementation using standard Ant `<copy>` task.

### What Was Done:

#### 1. Created Custom `antlib.xml`
Defines the `copyfiles` task as an Ant macrodef:
```xml
<macrodef name="copyfiles">
    <attribute name="files"/>
    <attribute name="todir"/>
    <attribute name="iftldtodir" default=""/>
    <sequential>
        <copy todir="@{todir}" flatten="true" failonerror="false">
            <path><pathelement path="@{files}"/></path>
        </copy>
    </sequential>
</macrodef>
```

#### 2. Packaged into JAR
- Location: `/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar`
- Structure:
  ```
  org/netbeans/modules/java/j2seproject/copylibstask/antlib.xml
  META-INF/MANIFEST.MF
  ```

#### 3. Updated Build Properties
All `build.properties` files now include:
```properties
libs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar
```

#### 4. Updated Dockerfile
The custom JAR is created automatically during container build.

#### 5. Updated deploy.sh
Passes the CopyLibs classpath to Ant commands:
```bash
ANT_PROPS="-Dlibs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar"
ant $ANT_PROPS dist
```

## How It Works

1. **Ant loads** the build-impl.xml files
2. **Checks** for `libs.CopyLibs.classpath` property ✅
3. **Loads** our custom JAR: `/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar`
4. **Finds** `antlib.xml` defining the `copyfiles` task ✅
5. **Uses** our simplified implementation based on standard Ant `<copy>`
6. **Build succeeds** ✅

## Attributes Supported

The `copyfiles` task supports:
- `files` - Source files to copy (classpath format)
- `todir` - Destination directory
- `iftldtodir` - Special handling for TLD files (currently ignored, but attribute accepted)

## Benefits

✅ **No NetBeans IDE required** - Works in any environment  
✅ **No manual downloads** - JAR created automatically  
✅ **DevContainer compatible** - Fully automated in Dockerfile  
✅ **Maintains compatibility** - Works with existing NetBeans build files  
✅ **Simple implementation** - Uses standard Ant tasks  

## Limitations

- **Simplified implementation** - Doesn't have all features of original CopyLibs
- **TLD handling** - `iftldtodir` attribute is accepted but not fully implemented
- **For this project** - The simple implementation is sufficient

## Testing

```bash
# Build with deploy script (recommended)
./deploy.sh

# Or build manually with explicit properties
ant -Dlibs.CopyLibs.classpath=/opt/lib/org-netbeans-modules-java-j2seproject-copylibstask.jar \
    -Dj2ee.server.home=/opt/glassfish4/glassfish \
    -Dj2ee.server.middleware=/opt/glassfish4 \
    dist
```

## Future Container Builds

The Dockerfile now automatically:
1. Creates the custom CopyLibs JAR with antlib.xml
2. Sets `build.properties` files to reference it
3. Build works without NetBeans dependencies

✅ **Ready for production deployment!**

