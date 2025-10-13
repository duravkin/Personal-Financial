FROM golang:1.25.1-alpine

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN go build -o /finance-backend

EXPOSE 8080

CMD ["/finance-backend"]