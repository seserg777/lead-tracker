import { Migration } from '@mikro-orm/migrations';

export class Migration20250415120000 extends Migration {
  override up(): void {
    this.addSql(
      "create table `lead` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `email` varchar(255) null, `company` varchar(255) null, `status` enum('NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST') not null, `value` float null, `notes` text null, `created_at` datetime not null, `updated_at` datetime not null) default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      'create table `comment` (`id` int unsigned not null auto_increment primary key, `text` varchar(500) not null, `created_at` datetime not null, `lead_id` int unsigned not null, constraint `comment_lead_id_foreign` foreign key (`lead_id`) references `lead` (`id`) on update cascade on delete cascade) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `comment` add index `comment_lead_id_index`(`lead_id`);',
    );
  }

  override down(): void {
    this.addSql('drop table if exists `comment`;');
    this.addSql('drop table if exists `lead`;');
  }
}
