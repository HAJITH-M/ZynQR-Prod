package redisconfig

import (
	"time"

	"ZynQR-Server/internal/config/env"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func RedisConfig() *redis.Client {
	RDB = redis.NewClient(&redis.Options{
		Addr:         env.AppEnv.REDIS_ADDR,
		Username:     env.AppEnv.REDIS_USERNAME,
		Password:     env.AppEnv.REDIS_PASSWORD,
		DB:           env.AppEnv.REDIS_DB,
		DialTimeout:  2 * time.Second,
		ReadTimeout:  2 * time.Second,
		WriteTimeout: 2 * time.Second,
	})

	return RDB
}
