import {useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { Card, Col, Row } from 'antd';


let ListProductsComponent = () => {
    let [products, setProducts] = useState([])

    useEffect(() => {
        getProducts();
    }, [])

    let getProducts = async () => {
        let response = await fetch(process.env.REACT_APP_BACKEND_BASE_URL+"/products",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            });

        if ( response.ok ){
            let jsonData = await response.json();

            let promisesForImages = jsonData.map( async p =>  {
                let urlImage = process.env.REACT_APP_BACKEND_BASE_URL+"/images/"+p.id+".png"
                let existsImage = await checkURL(urlImage);
                if ( existsImage )
                    p.image = urlImage
                else
                    p.image = "/imageMockup.png"
                return p
            })

            let productsWithImage = await Promise.all(promisesForImages)
            setProducts(productsWithImage)

        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach( e => {
                console.log("Error: "+e.msg)
            })
        }
    }


    let checkURL = async (url) => {
        try {
            let response = await fetch(url);
            console.log(response.ok)
            return response.ok; // Returns true if the status is in the 200-299 range.
        } catch (error) {
            return false; // URL does not exist or there was an error.
        }
    }


    return (
        <div>
            <h2>Products</h2>
            <Row gutter={ [16, 16] } >
                { products.map( p =>
                    <Col span={8} >
                        <Link to={ "/products/"+p.id } >
                            <Card key={p.id} title={ p.title }
                                  cover={<img src= { p.image } />}>
                                { p.price }
                            </Card>
                        </Link>
                    </Col>
                 )}
            </Row>
        </div>
    )
}

export default ListProductsComponent;