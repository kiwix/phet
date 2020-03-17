FROM openzim/zimwriterfs:latest

# Install necessary packages, npm and nodejs
RUN apt-get update && \
    apt-get install -y curl imagemagick && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

# Install phets scrapper
RUN git clone --depth=1 https://github.com/openzim/phet.git
RUN cd phet && npm install

# Boot commands
CMD cd phet && cat README.md ; /bin/bash
