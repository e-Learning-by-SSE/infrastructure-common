# maven common


## project-pom.xml
The project pom is a maven pom for the all infrastructure projects. It defines common build settings and dependencies.

To locally install or to publish it run:

```
mvn install -f project-pom.xml 
mvn deploy -f project-pom.xml
```

To use it in an infrastructure maven project, insert the following to the top of your pom.xml (you may need to change the version):

```
<parent>
	<groupId>net.ssehub.e-learning</groupId>
	<artifactId>infrastructure-parent</artifactId>
	<version>0.2.0</version>
</parent>
```

The pom is published to this [github maven repository](https://github.com/e-Learning-by-SSE/maven-packages/packages/).
If you don't wish to locally install the parent pom as maven dependency, you can use github's maven repository to automatically download it. Please visit https://github.com/e-Learning-by-SSE/maven-packages/blob/master/README.md for a description. In your project you need to add the following block:

```
<distributionManagement>
	<repository>
		<id>e-learning-by-sse-github</id> <!-- this must match the ID from the ~/.m2/settings.xml -->
		<name>GitHub e-learning-by-SSE Apache Maven Packages</name>
		<url>https://maven.pkg.github.com/e-learning-by-sse/maven-packages</url>
	</repository>
</distributionManagement>
```

## checkstyle.xml 

It is the checkstyle definition for infrastructure projects used in the parent pom. It is loaded via URL, so it is possible to apply changes here.
