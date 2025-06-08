# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the essential Maven files
COPY .mvn .mvn
COPY mvnw pom.xml ./

# Make the wrapper executable
RUN chmod +x ./mvnw

# Download dependencies (this is cached to speed up future builds)
RUN ./mvnw dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the application, creating the .jar file
RUN ./mvnw clean package -DskipTests


# Stage 2: Create the final, smaller runtime image
FROM openjdk:17-jdk-slim

WORKDIR /app

# This is the key step:
# Use a wildcard (*) to find the JAR file in the target directory
# and rename it to a consistent 'app.jar' inside the new image.
COPY --from=builder /app/target/*.jar app.jar

# Expose the port the application will run on
EXPOSE 8080

# The command to run your application
ENTRYPOINT ["java","-jar","app.jar"]