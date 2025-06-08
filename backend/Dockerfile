# Use OpenJDK 17 - compatible with Render's environment
FROM openjdk:17-jdk-slim

# Install necessary packages for building
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Maven wrapper files first (for better Docker layer caching)
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Copy pom.xml to download dependencies (cached layer)
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# Create a non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Expose port (Render will assign the actual port via $PORT)
EXPOSE 8080

# Health check for Render
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application with optimized JVM settings for containers
ENTRYPOINT ["java", \
    "-server", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dserver.port=${PORT:-8080}", \
    "-jar", \
    "target/CodePulseTracker-0.0.1-SNAPSHOT.jar"]

#services:
#  - type: web
#    name: codepulse-backend
#    env: docker
#    buildCommand: chmod +x ./mvnw && ./mvnw clean package -DskipTests
#    startCommand: java -Dserver.port=$PORT -jar target/CodePulseTracker-0.0.1-SNAPSHOT.jar
#    envVars:
#      - key: DB_URL
#        value: jdbc:postgresql://db.ygubxjhhsczcoowhrfxu.supabase.co:5432/postgres
#      - key: DB_USERNAME
#        value: postgres
#      - key: DB_PASSWORD
#        fromDatabase:
#          name: 312531
#          property: password
#      - key: a8f5f167f44f4964e6c998dee827110c985d5dc19ffa2c2c75b47b1b4329b8e7
#        generateValue: true