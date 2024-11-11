import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { Category } from './Category';
import {Review} from "./Review";
import {Brand} from "./Brand";
import {Wishlist} from "./WishList";
import { User } from './User';
import { Cart } from './Cart';
import { Order } from './Order';
import { OrderItem } from './OrderItem';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({default: ""})
    article!: string;

    @Column({default: 0})
    price!: number;

    @Column({default: null})
    oldPrice!: number;

    @Column('boolean', { default: true })
    isInStock!: boolean;

    @Column({ default: null })
    credit!: string;

    @Column({default: ""})
    slug!: string;

    @Column({default: ""})
    warranty!: string;

    @Column('json', { nullable: true })
    characteristics!: { name: string; value: string }[];

    @Column('text', { nullable: true })
    description!: string;

    @ManyToOne(() => Category, (category) => category.products)
    category!: Category;

    @OneToMany(() => Review, (review) => review.product)
    reviews!: Review[];

    @OneToMany(() => Order, (order) => order.product)
    orders!: Order[];

    @ManyToOne(() => Brand, (brand) => brand.products, { onDelete: 'SET NULL' })
    brand!: Brand;

    @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
    wishlist!: Wishlist[];

    @Column({nullable: true})
    imageUrl!: string;

    @Column({nullable: true})
    quantity!: number;

    @ManyToOne(() => User, (user) => user.products, { nullable: true, onDelete: 'SET NULL' })
    createdBy!: User;

    @Column({default: 0})
    views!: number;

    @CreateDateColumn()
    created!: Date;

    @UpdateDateColumn()
    updated!: Date;

    @OneToMany(() => Cart, (cart) => cart.product)
    carts!: Cart[];

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems!: OrderItem[];
}
