import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { Product } from './Product';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderDate!: Date;

    @ManyToOne(() => User, (user) => user.orders)
    user!: User;

    @Column('decimal')
    totalAmount!: number;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    items!: OrderItem[];

    @ManyToOne(() => Product, (product) => product.orders)
    product!: Product;

    @Column({
        type: 'enum',
        enum: ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'new'
    })
    status!: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}