
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/signin.svg";

import { useParams } from 'react-router';
import {useLocation} from "react-router-dom";

import {Helmet} from "react-helmet";

export default () => {
  const search = useLocation().search;
  const uuid = new URLSearchParams(search).get('uuid');
  const gcCodeTemplate = {
    "type": "tx",
    "ttl": 180,
    "title": "Cardano Summit 2021 Sevilla IDNFT",
    "description": "NFT conmemorativo de la asistencia al Cardano Summit 2021 en Sevilla. También válido como token de identidad para acceder a la web oficial :)",
    "outputs": {},
    "mints": [
        {
            "script": {
                "issuers": [
                    {
                        "accountIndex": 0,
                        "addressIndex": 0
                    }
                ],
                "beforeSlotOffset": 300
            },
            "assets": [
                {
                    "assetName": "@placeholder",
                    "quantity": "1"
                }
            ]
        }
    ],
    "metadata": {
        "721": {
            "0": {
                "@placeholder": {
                    "url": "cardanosevilla.github.io/summit2021",
                    "name": "Acreditación Cardano Summit Sevilla 2021",
                    "author": "Roberto C. Morano <rcmorano@gimbalabs.io>",
                    "image": ["ipfs://bafkreighrhthxz56zo3lagrxxyxzlwgy7cqdzvspg6oelivxya4mdu5", "eq4"],
                    "version": "1.0",
                    "mediaType": "image/png",
                    "files": [
                        {
                            "name": "CardanoSummitSevilla2021 Badge #nnnnn",
                            "mediaType": "image/png",
                            "src": ["ipfs://bafkreighrhthxz56zo3lagrxxyxzlwgy7cqdzvspg6oelivxya4mdu5", "eq4"],
                            "sha256": "c789e67be7becbb6b01a37be2f95d8d8f8a03cd64f379c45a2b7c038c1d3a487"
                        }
                    ]
                }
            }
        },
        "7368": {
            "0": {
                "@placeholder": {
                    "avatar": {
                        "src": ["ipfs://bafkreighrhthxz56zo3lagrxxyxzlwgy7cqdzvspg6oelivxya4mdu5", "eq4"]
                    },
                    "iss": "https://cardanosevilla.github.io",
                    "aud": [
                        "https://cardanosevilla.io"
                    ],
                    "iat": "31536000",
                    "nbf": "31536000",
                    "exp": "31736000",
                    "sub": "1234567890_12345_2312313_23123",
                    "id": "1231341",
                    "name": "placeholder",
                    "dom": "cardanosevilla"
                }
            }
        }
    }
  };

  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <p className="text-center">
              <FontAwesomeIcon className="me-2" /> ¡Bienvenidos al Sevilla Cardano Summit 2021!
          </p>
          <Row className="justify-content-center form-bg-image" style={{ backgroundImage: `url(${BgImage})` }}>
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="mb-4 mb-lg-0 bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">Mintea tu propio NFT de identidad para el evento</h3>
                </div>
                <Form className="mt-4">
                  <Form.Group id="uuid" className="mb-4">
                    <Form.Label>Id del Asistente</Form.Label>
                    <InputGroup>
                      <InputGroup.Text id="inputGroupPrepend">#
                      </InputGroup.Text>
                      <Form.Control autoFocus required disabled type="text" defaultValue={uuid}/>
                    </InputGroup>
                  </Form.Group>
                </Form>
                <Form className="mt-4">
                  <Form.Group id="username" className="mb-4">
                    <Form.Label>Usuario</Form.Label>
                    <InputGroup>
                      <InputGroup.Text id="inputGroupPrepend">@
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="text" placeholder="PaquitoBridge123" />
                    </InputGroup>
                  </Form.Group>
                </Form>
                <Form className="mt-4">
                  <Form.Group id="fullname" className="mb-4">
                    <Form.Label>Nombre Completo</Form.Label>
                    <InputGroup>
                      <InputGroup.Text id="inputGroupPrepend">@
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="text" placeholder="Puente del Quinto Centenario" />
                    </InputGroup>
                  </Form.Group>
                  <FormCheck type="checkbox" className="d-flex mb-4">
                    <FormCheck.Input required id="terms" className="me-2" />
                    <FormCheck.Label htmlFor="terms">
                      Estoy de acuerdo con los <Card.Link>términos y condiciones</Card.Link>
                    </FormCheck.Label>
                  </FormCheck>

                  <Button variant="primary" type="submit" className="w-100">
                    Sign up
                  </Button>
                </Form>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    ¿Ya tienes una cuenta?
                    <Card.Link as={Link} to={Routes.Signin.path} className="fw-bold">
                      {` Haz login pulsando aquí! `}
                    </Card.Link>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};
