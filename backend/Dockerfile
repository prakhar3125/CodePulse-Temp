services:
  - type: web
    name: codepulse-backend
    env: docker
    buildCommand: chmod +x ./mvnw && ./mvnw clean package -DskipTests
    startCommand: java -Dserver.port=$PORT -jar target/CodePulseTracker-0.0.1-SNAPSHOT.jar
    envVars:
      - key: DB_URL
        value: jdbc:postgresql://db.ygubxjhhsczcoowhrfxu.supabase.co:5432/postgres
      - key: DB_USERNAME
        value: postgres
      - key: DB_PASSWORD
        fromDatabase:
          name: 312531
          property: password
      - key: a8f5f167f44f4964e6c998dee827110c985d5dc19ffa2c2c75b47b1b4329b8e7
        generateValue: true