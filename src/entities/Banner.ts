import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Banner {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    slug!: string;

    @Column()
    imageUrl!: string;
}
