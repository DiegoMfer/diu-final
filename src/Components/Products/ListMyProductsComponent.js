import { useState, useEffect } from "react";
import { Table, Button, Space, Statistic, Row, Col, Card } from 'antd';
import { Link } from "react-router-dom";
import { timestampToString } from "../../Utils/UtilsDates";

const ListMyProductsComponent = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalProductsSold: 0,
        totalProductsBought: 0,
        totalEarnings: 0
    });

    useEffect(() => {
        getMyProducts();
    }, []);

    const deleteProduct = async (id) => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products/" + id,
            {
                method: "DELETE",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            }
        );

        if (response.ok) {
            const jsonData = await response.json();
            if (jsonData.deleted) {
                const productsAfterDelete = products.filter(p => p.id !== id);
                setProducts(productsAfterDelete);
                calculateStats(productsAfterDelete); // Update stats after deletion
            }
        } else {
            const responseBody = await response.json();
            const serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    const getMyProducts = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products/own/",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            }
        );

        if (response.ok) {
            let jsonData = await response.json();
            jsonData = jsonData.map(product => ({
                ...product,
                key: product.id, // Set a unique key for each product
            }));
            setProducts(jsonData);
            calculateStats(jsonData); // Calculate stats based on fetched data
        } else {
            const responseBody = await response.json();
            const serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    const calculateStats = (products) => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const stats = products.reduce(
            (acc, product) => {
                const productDate = new Date(product.date);
                if (productDate >= lastMonth && productDate <= now) {
                    if (product.sellerId === localStorage.getItem("userId")) {
                        acc.totalProductsSold += 1;
                        acc.totalEarnings += product.price;
                    }
                    if (product.buyerId === localStorage.getItem("userId")) {
                        acc.totalProductsBought += 1;
                    }
                }
                return acc;
            },
            { totalProductsSold: 0, totalProductsBought: 0, totalEarnings: 0 }
        );

        setStats(stats);
    };

    const columns = [
        {
            title: "Id",
            dataIndex: "id",
            sorter: (a, b) => a.id - b.id, // Sort by numeric ID
        },
        {
            title: "Seller Id",
            dataIndex: "sellerId",
            sorter: (a, b) => a.sellerId - b.sellerId, // Sort numerically
        },
        {
            title: "Title",
            dataIndex: "title",
            sorter: (a, b) => a.title.localeCompare(b.title), // Sort alphabetically
        },
        {
            title: "Description",
            dataIndex: "description",
            sorter: (a, b) => a.description.localeCompare(b.description), // Sort alphabetically
        },
        {
            title: "Price (€)",
            dataIndex: "price",
            sorter: (a, b) => a.price - b.price, // Sort by numeric price
        },
        {
            title: "Date",
            dataIndex: "date",
            render: (date) => timestampToString(date),
            sorter: (a, b) => new Date(a.date) - new Date(b.date), // Sort by date
        },
        {
            title: "Buyer",
            dataIndex: [],
            render: (product) =>
                <Link to={`/users/${product.buyerId}`}>{product.buyerEmail}</Link>,
            sorter: (a, b) => (a.buyerEmail || "").localeCompare(b.buyerEmail || ""), // Sort alphabetically, handle nulls
        },
        {
            title: "Actions",
            dataIndex: "id",
            render: (id) => (
                <Space direction="vertical">
                    <Link to={`/products/edit/${id}`}>
                        <Button type="primary">Edit</Button>
                    </Link>
                    <Button
                        type="primary"
                        danger
                        onClick={() => deleteProduct(id)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card style={{ marginBottom: 16 }} title="Sales Summary" bordered>
                <Row gutter={16}>
                    <Col span={8}>
                        <Statistic title="Total Products Sold (Last Month)" value={stats.totalProductsSold} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Total Products Bought (Last Month)" value={stats.totalProductsBought} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Total Earnings (€) (Last Month)" value={stats.totalEarnings} precision={2} />
                    </Col>
                </Row>
            </Card>
            <Table columns={columns} dataSource={products} />
        </>
    );
}

export default ListMyProductsComponent;
