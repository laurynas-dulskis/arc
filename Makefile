up:
	@docker compose up -d

up-build:
	@docker compose up --build -d --remove-orphans

down:
	@docker compose down

down-volumes:
	@docker compose down -v

exec-php:
	@docker compose exec backend-php sh

exec-database:
	@docker compose exec backend-database sh

fixer-fix:
	@docker compose exec -it --env PHP_CS_FIXER_IGNORE_ENV=1 backend-php vendor/bin/php-cs-fixer fix

fixer-check:
	@docker compose exec -it --env PHP_CS_FIXER_IGNORE_ENV=1 backend-php vendor/bin/php-cs-fixer check
