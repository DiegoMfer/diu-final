import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Alert, Avatar, Card, Descriptions, Divider, List, Spin, Typography} from "antd";

const {Title} = Typography;

const UserProfile = () => {
    const {id} = useParams();
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState({user: true, transactions: true, products: true});
    const [error, setError] = useState({user: null, transactions: null, products: null});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/users/${id}`, {
                    method: "GET", headers: {
                        "apikey": localStorage.getItem("apiKey")
                    },
                });


                if (!userResponse.ok) throw new Error("Failed to fetch user data");
                const userData = await userResponse.json();
                setUser(userData);
            } catch (error) {
                setError(prev => ({...prev, user: error.message}));
            } finally {
                setLoading(prev => ({...prev, user: false}));
            }
        };

        const fetchTransactions = async () => {
            try {
                const transactionsResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/transactions/public?sellerId=${id}`, {
                    method: "GET", headers: {
                        "apikey": localStorage.getItem("apiKey")
                    },
                });


                if (!transactionsResponse.ok) throw new Error("Failed to fetch transactions");
                const transactionsData = await transactionsResponse.json();
                setTransactions(transactionsData);
            } catch (error) {
                setError(prev => ({...prev, transactions: error.message}));
            } finally {
                setLoading(prev => ({...prev, transactions: false}));
            }
        };

        const fetchProducts = async () => {
            try {
                const productsResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/products?sellerId=${id}`, {
                    method: "GET", headers: {
                        "apikey": localStorage.getItem("apiKey")
                    },
                });
                if (!productsResponse.ok) throw new Error("Failed to fetch products");
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                setError(prev => ({...prev, products: error.message}));
            } finally {
                setLoading(prev => ({...prev, products: false}));
            }
        };

        fetchUserData();
        fetchTransactions();
        fetchProducts();
    }, [id]);

    const isLoading = Object.values(loading).some((status) => status);

    if (isLoading) {
        return <Spin tip="Loading profile..."
                     style={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh"}}/>;
    }

    return (<Card style={{margin: "20px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto"}}>
            <Title level={3}>User Profile</Title>

            {/* User Info Section */}
            {user ? (<Descriptions bordered column={1} style={{marginTop: "20px"}}>
                    <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                    <Descriptions.Item label="Surname">{user.surname}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="Document Identity">{user.documentIdentity}</Descriptions.Item>
                    <Descriptions.Item label="Document Number">{user.documentNumber}</Descriptions.Item>
                    <Descriptions.Item label="Country">{user.country}</Descriptions.Item>
                    <Descriptions.Item label="Address">{user.address}</Descriptions.Item>
                    <Descriptions.Item label="Postal Code">{user.postalCode}</Descriptions.Item>
                    <Descriptions.Item
                        label="Birthday">{new Date(user.birthday).toLocaleDateString()}</Descriptions.Item>
                </Descriptions>) : (
                <Alert message="Unable to load user information" description={error.user} type="error" showIcon
                       style={{marginTop: "10px"}}/>)}

            <Divider/>

            {/* Transactions Section */}
            <Title level={4}>Transactions</Title>
            {transactions.length > 0 ? (<List
                    itemLayout="horizontal"
                    dataSource={transactions}
                    renderItem={transaction => (<List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src="https://via.placeholder.com/50"/>}
                                title={`Transaction ID: ${transaction.id}`}
                                description={`Amount: ${transaction.amount} | Date: ${new Date(transaction.date).toLocaleDateString()}`}
                            />
                        </List.Item>)}
                />) : (error.transactions ? (
                    <Alert message="Unable to load transactions" description={error.transactions} type="error" showIcon
                           style={{marginTop: "10px"}}/>) : (
                    <Alert message="No transactions found" type="info" showIcon style={{marginTop: "10px"}}/>))}

            <Divider/>

            {/* Products Section */}
            <Title level={4}>Products for Sale</Title>
            {products.length > 0 ? (<List
                    grid={{gutter: 16, column: 1}}
                    dataSource={products}
                    renderItem={product => (<List.Item>
                            <Card
                                title={product.name}
                                extra={<span>Price: ${product.price}</span>}
                            >
                                <p>{product.description}</p>
                                <p>Category: {product.category}</p>
                            </Card>
                        </List.Item>)}
                />) : (error.products ? (
                    <Alert message="Unable to load products" description={error.products} type="error" showIcon
                           style={{marginTop: "10px"}}/>) : (
                    <Alert message="No products for sale" type="info" showIcon style={{marginTop: "10px"}}/>))}
        </Card>);
};

export default UserProfile;
