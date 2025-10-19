FROM golang:1.25.3-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN go build -o /main ./cmd/app/main.go

EXPOSE 8080

CMD ["/main"]