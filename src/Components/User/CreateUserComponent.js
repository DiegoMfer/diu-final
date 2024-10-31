import React, {useState} from "react";
import {modifyStateProperty} from "../../Utils/UtilsState";
import {Button, Card, Col, Form, Input, Row, Steps, Typography} from "antd";
import {useNavigate} from 'react-router-dom';
import {
    allowSubmitForm,
    joinAllServerErrorMessages,
    setServerErrors,
    validateFormDataInputEmail,
    validateFormDataInputRequired
} from "../../Utils/UtilsValidations";

const {Step} = Steps;

let CreateUserComponent = (props) => {
    let {openNotification} = props;
    let navigate = useNavigate();

    // State for form data and errors
    let requiredInForm = ["email", "password"];  // Cambiado a email
    let [formErrors, setFormErrors] = useState({});
    let [formData, setFormData] = useState({
        email: '',  // Cambiado a email
        password: '',
        name: '',
        surname: '',
        documentIdentity: '',
        documentNumber: '',
        country: '',
        address: '',
        postalCode: '',
        birthday: ''
    });

    // State for the current step
    let [currentStep, setCurrentStep] = useState(0);

    // Step fields configuration
    const steps = [
        {
            title: "Account",
            fields: [
                {label: "Email", name: "email", type: "text", validator: validateFormDataInputEmail},  // Cambiado a email
                {label: "Password", name: "password", type: "password", validator: validateFormDataInputRequired},
            ]
        },
        {
            title: "Information",
            fields: [
                {label: "Name", name: "name", type: "text", validator: null},
                {label: "Surname", name: "surname", type: "text", validator: null},
                {label: "Document Identity", name: "documentIdentity", type: "text", validator: null},
                {label: "Document Number", name: "documentNumber", type: "text", validator: null},
                {label: "Country", name: "country", type: "text", validator: null},
            ]
        },
        {
            title: "Address ",
            fields: [
                {label: "Address", name: "address", type: "text", validator: null},
                {label: "Postal Code", name: "postalCode", type: "text", validator: null},
                {
                    label: "Birthday",
                    name: "birthday",
                    type: "date",
                    validator: null

                },
            ]
        }
    ];

    // Function to handle form submission
    const clickCreate = async () => {
        const cleanedData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value || null])
        );

        if (cleanedData.birthday) {
            cleanedData.birthday = new Date(cleanedData.birthday).getTime();
        }

        let response = await fetch(process.env.REACT_APP_BACKEND_BASE_URL + "/users", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(cleanedData)
        });

        if (response.ok) {
            let responseBody = await response.json();
            console.log("User created:", responseBody);
            openNotification("top", "User registration successful", "success");
            navigate("/login");
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            setServerErrors(serverErrors, setFormErrors);
            let notificationMsg = joinAllServerErrorMessages(serverErrors);
            openNotification("top", notificationMsg, "error");
        }
    };

    // Handle next step
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Handle previous step
    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Render component
    return (
        <Row align="middle" justify="center" style={{minHeight: "80vh"}}>
            <Col xs={24} sm={24} md={16} lg={12} xl={8}>
                <Card title="Create User" style={{margin: "15px"}}>
                    <Steps current={currentStep}>
                        {steps.map(step => (
                            <Step key={step.title} title={step.title}/>
                        ))}
                    </Steps>
                    <Form layout="vertical" style={{marginTop: "20px"}}>
                        {steps[currentStep].fields.map(field => (
                            <Form.Item key={field.name} label={field.label} validateStatus={
                                field.validator ? field.validator(formData, field.name, formErrors, setFormErrors) ? "success" : "error" : ""
                            }>
                                <Input
                                    type={field.type}
                                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                                    value={formData[field.name]}
                                    onChange={(e) => modifyStateProperty(formData, setFormData, field.name, e.currentTarget.value)}
                                />
                                {formErrors?.[field.name]?.msg && (
                                    <Typography.Text type="danger">{formErrors[field.name].msg}</Typography.Text>
                                )}
                            </Form.Item>
                        ))}

                        <Form.Item>
                            <Button type="default" onClick={previousStep} disabled={currentStep === 0}>
                                Previous
                            </Button>
                            {currentStep < steps.length - 1 ? (
                                <Button type="primary" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="primary" onClick={clickCreate}
                                        disabled={!allowSubmitForm(formData, formErrors, requiredInForm)}>
                                    Create User
                                </Button>
                            )}
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
}

export default CreateUserComponent;
