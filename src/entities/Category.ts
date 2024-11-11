import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './Product';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    slug!: string;

    @Column({default: ""})
    icon!: string;

    @OneToMany(() => Product, (product) => product.category)
    products!: Product[];
}
