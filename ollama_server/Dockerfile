FROM ollama/ollama:0.30.8

ENV OLLAMA_HOST=0.0.0.0

COPY Modelfile /Modelfile
COPY phi3-financial-q4.gguf /phi3-financial-q4.gguf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 11434

ENTRYPOINT ["/entrypoint.sh"]