# build with `docker build -t debian:dancer .`
FROM debian:latest

RUN apt update \
    && apt install -y cpanminus libdancer2-perl starman gcc psmisc ffmpeg \
    && mkdir -p /usr/src/app
WORKDIR /usr/src/app
EXPOSE 5000
CMD starman -l 0.0.0.0:5000 --access-log /dev/stdout bin/app.psgi
