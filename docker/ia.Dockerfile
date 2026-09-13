FROM python:3.11-slim

WORKDIR /srv

COPY requirements.txt /srv/requirements.txt
RUN pip install --no-cache-dir -r /srv/requirements.txt

EXPOSE 15003

CMD ["python", "-m", "uvicorn", "api.ia_api:app", "--host", "0.0.0.0", "--port", "15003"]
