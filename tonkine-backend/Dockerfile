# ═══════════════════════════════════════════════════════════════
# TonKiné au Travail — Dockerfile Backend
# Build multi-stage : compile puis crée l'image finale légère
# ═══════════════════════════════════════════════════════════════

# ── Étape 1 : Compilation Maven ──
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copie le pom.xml en premier pour bénéficier du cache des dépendances
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B 2>/dev/null || true

# Copie les sources et compile
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests -B

# ── Étape 2 : Image d'exécution légère ──
FROM eclipse-temurin:17-jre-alpine AS runtime

# Métadonnées
LABEL maintainer="TonKiné au Travail"
LABEL description="API Backend Spring Boot — Kinésithérapie d'entreprise"

# Utilisateur non-root pour la sécurité
RUN addgroup -S tonkine && adduser -S tonkine -G tonkine

WORKDIR /app

# Dossier de stockage des photos posture (monté comme volume en prod)
RUN mkdir -p /app/uploads/photos-posture && \
    chown -R tonkine:tonkine /app

# Copie le JAR depuis l'étape de build
COPY --from=builder /build/target/tonkine-backend-*.jar app.jar

USER tonkine

# Variables d'environnement par défaut (surchargées par docker-compose ou K8s)
ENV SPRING_PROFILES_ACTIVE=postgres
ENV SERVER_PORT=8080
ENV TZ=Africa/Douala

EXPOSE 8080

# Démarrage avec options JVM optimisées pour container
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
