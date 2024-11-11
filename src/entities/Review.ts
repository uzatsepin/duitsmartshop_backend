
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

import { Product } from './Product';

import { User } from './User';



@Entity()

export class Review {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Product, product => product.reviews)
    product!: Product;

    @ManyToOne(() => User, user => user.reviews)
    user!: User;

    @Column()
    rating!: number;

    @Column('text', { nullable: true })
    text!: string;

    @Column({ default: 0 })
    likes!: number;

    @CreateDateColumn()
    created!: Date;
}
