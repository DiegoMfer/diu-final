import { useState } from "react";
import { modifyStateProperty } from "../../Utils/UtilsState";
import { Card, Input, Button, Row, Col, Form, Typography, Upload, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../Reducers/reducerCountSlice";

const { Option } = Select;

let CreateProductComponent = () => {

    // Predefined categories
    const categories = ["Electronics", "Clothing", "Books", "Home", "Beauty", "Toys", "Sports"];

    // State for form data
    let [formData, setFormData] = useState({});

    let clickCreateProduct = async () => {
        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": localStorage.getItem("apiKey")
                },
                body: JSON.stringify(formData)
            });

        if (response.ok) {
            let data = await response.json();
            await uploadImage(data.productId);
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    let uploadImage = async (productId) => {
        let formDataPhotos = new FormData();
        formDataPhotos.append('image', formData.image);
        formDataPhotos.append('productId', productId);

        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products/" + productId + "/image", {
                method: "POST",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
                body: formDataPhotos
            });
        if (!response.ok) {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    return (
        <Row align="middle" justify="center" style={{ minHeight: "70vh" }}>
            <Col>
                <Card title="Create product" style={{ width: "500px" }}>
                    <Form
                        layout="vertical" // Sets label and input vertically by default
                    >
                        <Form.Item label="Title" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Input
                                onChange={(i) => modifyStateProperty(formData, setFormData, "title", i.currentTarget.value)}
                                size="large"
                                type="text"
                                placeholder="Product title"
                            />
                        </Form.Item>

                        <Form.Item label="Description" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Input
                                onChange={(i) => modifyStateProperty(formData, setFormData, "description", i.currentTarget.value)}
                                size="large"
                                type="text"
                                placeholder="Description"
                            />
                        </Form.Item>

                        <Form.Item label="Price" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Input
                                onChange={(i) => modifyStateProperty(formData, setFormData, "price", i.currentTarget.value)}
                                size="large"
                                type="number"
                                placeholder="Price"
                            />
                        </Form.Item>

                        <Form.Item label="Category" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Select
                                placeholder="Select a category"
                                onChange={(value) => modifyStateProperty(formData, setFormData, "category", value)}
                                size="large"
                            >
                                {categories.map((category) => (
                                    <Option key={category} value={category}>{category}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="image" label="Image" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                            <Upload
                                maxCount={1}
                                beforeUpload={(file) => modifyStateProperty(formData, setFormData, "image", file)}
                                listType="picture-card"
                            >
                                Upload
                            </Upload>
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }}>
                            <Button type="primary" block onClick={clickCreateProduct}>Sell Product</Button>
                        </Form.Item>
                    </Form>
                </Card>

            </Col>
        </Row>
    );
};

export default CreateProductComponent;
