<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251101170450 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE flight ADD number_of_layovers INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD base_price_cents_economy INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD base_price_cents_business INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD base_price_cents_first_class INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD seats_economy INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD seats_business INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD seats_first_class INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight DROP base_price_cents');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE flight ADD base_price_cents INT NOT NULL');
        $this->addSql('ALTER TABLE flight DROP number_of_layovers');
        $this->addSql('ALTER TABLE flight DROP base_price_cents_economy');
        $this->addSql('ALTER TABLE flight DROP base_price_cents_business');
        $this->addSql('ALTER TABLE flight DROP base_price_cents_first_class');
        $this->addSql('ALTER TABLE flight DROP seats_economy');
        $this->addSql('ALTER TABLE flight DROP seats_business');
        $this->addSql('ALTER TABLE flight DROP seats_first_class');
    }
}
