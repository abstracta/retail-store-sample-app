# Build Stage
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as build-env

# We tell DNF not to install Recommends and Suggests packages, which are
# weak dependencies in DNF terminology, thus keeping our installed set of
# packages as minimal as possible.
RUN dnf --setopt=install_weak_deps=False install -q -y \
    git \
    golang \
    tar \
    gzip \
    && \
    dnf clean all

RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin" /appsrc

ARG SKYWALKING_AGENT_VERSION=0.5.0
RUN curl -L https://dlcdn.apache.org/skywalking/go/${SKYWALKING_AGENT_VERSION}/apache-skywalking-go-${SKYWALKING_AGENT_VERSION}-bin.tgz -o /tmp/skywalking-agent.tgz
RUN tar -xzf /tmp/skywalking-agent.tgz -C /opt/
RUN rm /tmp/skywalking-agent.tgz

ENV SW_AGENT_NAME=catalog
ENV SW_AGENT_REPORTER_GRPC_BACKEND_SERVICE=oap:11800

WORKDIR /appsrc

COPY . .

ENV GOPROXY=direct
RUN go build -toolexec="/opt/apache-skywalking-go-${SKYWALKING_AGENT_VERSION}-bin/bin/skywalking-go-agent-${SKYWALKING_AGENT_VERSION}-linux-amd64" -a -o main main.go

# Final stage
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000

# We tell DNF not to install Recommends and Suggests packages, which are
# weak dependencies in DNF terminology, thus keeping our installed set of
# packages as minimal as possible.
RUN dnf --setopt=install_weak_deps=False install -q -y \
    shadow-utils \
    && \
    dnf clean all

RUN useradd \
    --home "/app" \
    --create-home \
    --user-group \
    --uid "$APPUID" \
    "$APPUSER"

WORKDIR /app
USER appuser

COPY --chown=appuser:appuser --from=build-env /appsrc/main /app/
COPY --chown=appuser:appuser db/ /app/db/

ENV SW_AGENT_NAME=catalog
ENV SW_AGENT_REPORTER_GRPC_BACKEND_SERVICE=oap:11800

COPY ./ATTRIBUTION.md ./LICENSES.md

ENV GIN_MODE=release

ENTRYPOINT ["/app/main"]
