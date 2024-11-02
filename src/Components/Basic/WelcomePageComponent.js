// src/Welcome.js
import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { imagedCategories } from "../../Utils/UtilsCategories"; // Make sure to import your updated categories

const WelcomePageComponent = () => {
    return (
        <div style={{ textAlign: 'center', backgroundColor: '#f8f9fa', padding: '20px' }}>
            <Typography.Title level={1}>Welcome to Our Shop</Typography.Title>
            <Row gutter={16} justify="center">
                {imagedCategories.map((category, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}> {/* Responsive grid sizes */}
                        <Card
                            title={category.name}
                            bordered
                            hoverable
                            style={{
                                transition: 'transform 0.2s',
                                marginBottom: '16px',
                                height: '320px' // Increased height for the card
                            }}
                        >
                            <img
                                src={category.image}
                                alt={category.name}
                                style={{
                                    width: '100%',
                                    height: '200px', // Taller image height
                                    objectFit: 'cover', // Cover the area without distortion
                                    marginBottom: '12px'
                                }}
                            />
                            <p style={{ marginBottom: 0 }}>Explore the latest in {category.name}!</p>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default WelcomePageComponent;
