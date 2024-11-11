import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { Role } from './Role';
import {Wishlist} from "./WishList";
import {Review} from "./Review";
import { Order } from './Order';
import {Product} from "./Product";
import { Cart } from './Cart';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @ManyToOne(() => Role, (role) => role.users)
    role!: Role;

    @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
    wishlist!: Wishlist[];

    @OneToMany(() => Review, (review) => review.user)
    reviews!: Review[];

    @OneToMany(() => Order, (order) => order.user)
    orders!: Order[];

    @OneToMany(() => Product, (product) => product.createdBy)
    products!: Product[];

    @CreateDateColumn()
    created!: Date;

    @UpdateDateColumn()
    updated!: Date;

    @OneToMany(() => Cart, (cart) => cart.user)
    carts!: Cart[];

}
