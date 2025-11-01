<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251101171353 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE flight ADD seats_available_economy INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD seats_available_business INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight ADD seats_available_first_class INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE flight DROP seats_available');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE flight ADD seats_available INT NOT NULL');
        $this->addSql('ALTER TABLE flight DROP seats_available_economy');
        $this->addSql('ALTER TABLE flight DROP seats_available_business');
        $this->addSql('ALTER TABLE flight DROP seats_available_first_class');
    }
}
