import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";

import Signin from "./examples/Signin";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import BgImage from "../assets/img/illustrations/signin.svg";
import Preloader from "../components/Preloader";

import { useParams } from 'react-router';
import {useLocation} from "react-router-dom";
import {checkValidationList, inputValidate} from "../utils/utils";

import { uuid as uuidV4 } from 'uuidv4';

const codec = require('json-url')('lzw');

var theWorstHashEver = function(s) {
  for(var i = 0, h = 0xdeadbeef; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
  return String((h ^ h >>> 16) >>> 0);
};

const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route {...rest} render={props => ( <> <Preloader show={loaded ? false : true} /> <Component {...props} /> </> ) } />
  );
};

export default () => {
    const search = useLocation().search;
    const uuid = new URLSearchParams(search).get('uuid') || ("ext-"+uuidV4());
    const [values,setValues] = useState({
        uuid,
        username: "",
        fullname: "",
        checkbox: ""
    });
    const [validValues,setValidValues] = useState({
        uuid: true,
        username: false,
        fullname: false,
        checkbox: false
    });

    const handle=`@${values.username}`;
    const issuedAt=Math.floor(Date.now() / 1000);
    const expirationDelta=(60*60*24*2);
    const gcCodeTemplate = {
    "type": "tx",
    "ttl": 180,
    "title": `${handle} login a Cardano Summit 2021 Sevilla`,
    "description": `Hola ${values.fullname}! Estás por crear tu NFT conmemorativo de la asistencia al Cardano Summit 2021 en Sevilla. Úsalo para acceder a la web oficial :)`,
    "onSuccessURL": "/#/signin",
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
                    "assetName": handle,
                    "quantity": "1"
                }
            ]
        },
        {
            "script": {
                "issuers": [
                    {
                        "accountIndex": 1,
                        "addressIndex": 1
                    }
                ],
                "beforeSlotOffset": 300
            },
            "assets": [
                {
                    "assetName": handle,
                    "quantity": "1"
                }
            ]
        }
    ],
    "metadata": {
        "721": {
            "0": {
                [handle]: {
                    "url": "cardanosevilla.github.io/summit2021",
                    "name": "Recuerdo Cardano Summit Sevilla 2021",
                    "author": ["Roberto C. Morano <rcmorano@gimbalabs.io>", "Adriano Fiorenza <placeholder>"],
                    "image": "ipfs://QmUHfKLkwre92ue44vGHAvzEwi44nGTqGozsSy4KEKB1eF",
                    "version": "1.0",
                    "mediaType": "image/png",
                    "files": [
                        {
                            "name": "CardanoSummitSevilla2021 Badge #nnnnn",
                            "mediaType": "image/png",
                            "src": "ipfs://QmUHfKLkwre92ue44vGHAvzEwi44nGTqGozsSy4KEKB1eF",
                            "sha256": "c789e67be7becbb6b01a37be2f95d8d8f8a03cd64f379c45a2b7c038c1d3a487"
                        }
                    ]
                }
            }
        },
        "7368": {
            "1": {
                [handle]: {
                    "avatar": {
                        "src": "ipfs://QmUHfKLkwre92ue44vGHAvzEwi44nGTqGozsSy4KEKB1eF",
                    },
                    "iss": "https://cardanosevilla.github.io",
                    "aud": [
                        "https://cardanosevilla.io"
                    ],
                    "iat": String(issuedAt),
                    "nbf": String(issuedAt),
                    "exp": String(issuedAt + expirationDelta ),
                    "sub": values.uuid ,
                    "id": theWorstHashEver(`${values.username}}`),
                    "name": values.fullname,
                    "dom": "cardanosevilla",
                    extras:{
                      "url": "cardanosevilla.github.io/cardano-summit-2021",
                      "name": "Acreditación Cardano Summit Sevilla 2021",
                      "author": ["Roberto C. Morano <rcmorano@gimbalabs.io>", "Adriano Fiorenza <placeholder>"],
                    }
                }
            }
        }
      }
    };
    console.log({values,gcCodeTemplate});

    const onValueChange=(field)=>(event)=>{
        setValues({...values, [field]:event.target.value});

        // Check if the input pass all regex match list
        const validatedList = inputValidate(event.target.value);

        // Get if all regexs are valid
        const validInput = checkValidationList(validatedList);
        setValidValues({...validValues, [field]:validInput});

    }
    const onSubmit=(event)=>{
        event.preventDefault();
        codec.compress(gcCodeTemplate).then(result => {
          window.location.href = `https://testnet-wallet.gamechanger.finance/api/1/tx/${result}`;
        });
    }
    const onLoginClick=(event)=>{
        event.preventDefault();
        window.location.href = `https://testnet-wallet.gamechanger.finance/api/1/address`;
    }

    const onCheckBoxChange= (field)=>(event)=>{
        setValidValues({...validValues, [field]:event.target.checked});
    }

    const formIsValid = validValues.username && validValues.checkbox && values.uuid!==null;

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
                    <InputGroup >
                      <InputGroup.Text id="inputGroupPrepend">@
                      </InputGroup.Text>
                      <Form.Control onChange={onValueChange("username")}  autoFocus required type="text" placeholder="PaquitoBridge123" />
                    </InputGroup>
                  </Form.Group>
                </Form>
                <Form className="mt-4">
                  <Form.Group id="fullname" className="mb-4">
                    <Form.Label>Nombre Completo (opcional)</Form.Label>
                    <InputGroup  >
                      <Form.Control onChange={onValueChange("fullname")} autoFocus type="text" placeholder="" />
                    </InputGroup>
                  </Form.Group>
                  <FormCheck  type="checkbox" className="d-flex mb-4">
                    <FormCheck.Input onChange={onCheckBoxChange("checkbox")} required id="terms" className="me-2" />
                    <FormCheck.Label htmlFor="terms">
                      Estoy de acuerdo en mintear <Card.Link> este NFT</Card.Link>
                    </FormCheck.Label>
                  </FormCheck>

                  <Button disabled={!formIsValid} onClick={onSubmit} variant="primary" type="submit" className="w-100">
                    Sign up
                  </Button>
                </Form>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    <p className="text-center">
                    ¿Ya tienes una cuenta?
                    </p>
                    <Route exact path={Routes.Signin.path} component={ Signin } />     
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
