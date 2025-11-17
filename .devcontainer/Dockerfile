# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/python:3.12

# Install additional CLI tools
USER root
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=${USER_UID}
ARG DOCKER_GID=1001
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        postgresql-client \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        docker-ce-cli \
        docker-compose-plugin \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install git-subtree (not available as a package in Debian Trixie)
RUN curl -fsSL https://raw.githubusercontent.com/git/git/master/contrib/subtree/git-subtree.sh -o /usr/local/bin/git-subtree \
    && chmod +x /usr/local/bin/git-subtree

# Ensure target user exists (some base variants omit it)
RUN if ! id -u "${USERNAME}" >/dev/null 2>&1; then \
        groupadd --gid "${USER_GID}" "${USERNAME}" && \
        useradd --uid "${USER_UID}" --gid "${USER_GID}" -m "${USERNAME}"; \
    fi

# Ensure docker group matches host socket permissions and add user to it
RUN DOCKER_GID_SAFE=${DOCKER_GID:-1001}; \
    if ! getent group docker >/dev/null 2>&1; then \
        groupadd --gid "${DOCKER_GID_SAFE}" docker; \
    elif [ -n "${DOCKER_GID_SAFE}" ] && [ "$(getent group docker | cut -d: -f3)" != "${DOCKER_GID_SAFE}" ]; then \
        groupmod --gid "${DOCKER_GID_SAFE}" docker; \
    fi \
    && usermod -aG docker "${USERNAME}"

# Runtime helper to align docker socket permissions
RUN cat <<'EOF' >/usr/local/bin/fix-docker-permissions.sh && chmod +x /usr/local/bin/fix-docker-permissions.sh
#!/usr/bin/env bash
set -euo pipefail
TARGET_USER="${1:-vscode}"
SOCKET_PATH="${2:-/var/run/docker.sock}"
if [ ! -S "${SOCKET_PATH}" ]; then
  exit 0
fi
SOCKET_GID=$(stat -c '%g' "${SOCKET_PATH}")
if [ "${SOCKET_GID}" = "0" ]; then
  usermod -aG root "${TARGET_USER}" || true
  chgrp root "${SOCKET_PATH}" || true
else
  if ! getent group docker >/dev/null 2>&1; then
    groupadd --gid "${SOCKET_GID}" docker
  else
    EXISTING_GID=$(getent group docker | cut -d: -f3)
    if [ "${EXISTING_GID}" != "${SOCKET_GID}" ]; then
      groupmod --gid "${SOCKET_GID}" docker
    fi
  fi
  usermod -aG docker "${TARGET_USER}"
  chgrp docker "${SOCKET_PATH}" || true
fi
chmod 666 "${SOCKET_PATH}"
EOF

# Pre-install useful Python tooling
ENV PIPX_HOME=/opt/pipx \
    PIPX_BIN_DIR=/opt/pipx/bin \
    PATH=${PIPX_BIN_DIR}:${PATH}
RUN pipx ensurepath \
    && pipx install uv \
    && pipx install ruff

# Ensure the vscode user owns pipx directories and has tooling on PATH
RUN mkdir -p "${PIPX_HOME}" "${PIPX_BIN_DIR}" \
    && chown -R "${USERNAME}":"${USERNAME}" "${PIPX_HOME}"

USER ${USERNAME}
WORKDIR /workspaces/hotel-modernization
