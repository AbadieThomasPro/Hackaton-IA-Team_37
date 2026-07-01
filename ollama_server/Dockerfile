FROM ollama/ollama:0.30.8

ENV OLLAMA_HOST=0.0.0.0

COPY Modelfile /Modelfile
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 11434

ENTRYPOINT ["/entrypoint.sh"]