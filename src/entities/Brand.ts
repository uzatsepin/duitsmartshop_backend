import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './Product';

@Entity()
export class Brand {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    slug!: string;

    @Column({default: ''})
    icon!: string;

    @Column('text', { nullable: true })
    description!: string;

    @OneToMany(() => Product, (product) => product.brand)
    products!: Product[];
}
