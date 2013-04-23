--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: delivery_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE delivery_id_seq
    START WITH 19
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_id_seq OWNER TO mailcrunch;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: delivery; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE delivery (
    userdef_id character varying(255) NOT NULL,
    subject character varying(998) NOT NULL,
    from_email_address character varying(256) NOT NULL,
    friendly_name character varying(256),
    body_html text,
    body_text text,
    id integer DEFAULT nextval('delivery_id_seq'::regclass) NOT NULL,
    last_modified_date timestamp with time zone,
    created_by bigint,
    modified_by bigint,
    creation_date timestamp with time zone
);


ALTER TABLE public.delivery OWNER TO mailcrunch;

--
-- Name: delivery_userdef; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE delivery_userdef
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_userdef OWNER TO mailcrunch;

--
-- Name: navtree; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE navtree (
    id bigint NOT NULL,
    parent_id bigint DEFAULT 0,
    userdef_id character varying(100) NOT NULL,
    name character varying,
    acl character varying,
    icon_url character varying,
    weight integer DEFAULT 100,
    view character varying(200)
);


ALTER TABLE public.navtree OWNER TO mailcrunch;

--
-- Name: navtree_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE navtree_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.navtree_id_seq OWNER TO mailcrunch;

--
-- Name: navtree_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailcrunch
--

ALTER SEQUENCE navtree_id_seq OWNED BY navtree.id;


--
-- Name: operators_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE operators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operators_id_seq OWNER TO mailcrunch;

--
-- Name: operator; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE operator (
    id integer DEFAULT nextval('operators_id_seq'::regclass) NOT NULL,
    username character varying NOT NULL,
    password character varying(30),
    last_modified_date timestamp with time zone DEFAULT now(),
    creation_date timestamp with time zone DEFAULT now(),
    acl bit varying(255)
);


ALTER TABLE public.operator OWNER TO mailcrunch;

--
-- Name: pk; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE pk
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
    CYCLE;


ALTER TABLE public.pk OWNER TO mailcrunch;

--
-- Name: recipient; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE recipient (
    id bigint NOT NULL,
    lastname character varying(255),
    firstname character varying(255),
    email character varying(255),
    landline character varying(20),
    mobile character varying(20),
    country_iso character(2),
    address1 character varying(100),
    address2 character varying(100),
    city character varying(100),
    region character varying(50),
    state character varying(50),
    zip_postcode character varying(15),
    creation_date timestamp with time zone DEFAULT now() NOT NULL,
    last_modified_date timestamp with time zone DEFAULT now(),
    created_by bigint,
    modified_by bigint
);


ALTER TABLE public.recipient OWNER TO mailcrunch;

--
-- Name: recipient_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE recipient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.recipient_id_seq OWNER TO mailcrunch;

--
-- Name: recipient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailcrunch
--

ALTER SEQUENCE recipient_id_seq OWNED BY recipient.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY navtree ALTER COLUMN id SET DEFAULT nextval('navtree_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY recipient ALTER COLUMN id SET DEFAULT nextval('recipient_id_seq'::regclass);


--
-- Data for Name: delivery; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY delivery (userdef_id, subject, from_email_address, friendly_name, body_html, body_text, id, last_modified_date, created_by, modified_by, creation_date) FROM stdin;
87	CICCIO	nicoletto@ciccio	\N	\N	\N	101	\N	\N	\N	\N
88	CICCIO	nicoletto@ciccio.com	\N	\N	\N	102	\N	\N	\N	\N
89	CICCIO	nicoletto@ciccio.com	\N	\N	\N	103	\N	\N	\N	\N
95	TEST2	gi	\N	\N	\N	109	\N	\N	\N	\N
96	TEST2	gio	\N	\N	\N	110	\N	\N	\N	\N
97	TEST2	gino	\N	\N	\N	111	\N	\N	\N	\N
98	TEST2	gino	\N	\N	\N	112	\N	\N	\N	\N
99	TEST2	gino	\N	\N	\N	113	\N	\N	\N	\N
105	gino	ahahah	\N	\N	\N	136	\N	\N	\N	\N
delivery131	ccccccccccc	aaaaaa	hbbbbbbbb	\N	\N	139	\N	\N	\N	\N
delivery132	saaaaaaaaaaaaaa	aaaaaaaaaaa	ddddddddd	\N	\N	140	\N	\N	\N	\N
delivery133	sdfsdf	test creationdate	ss	\N	\N	141	\N	\N	\N	\N
delivery135	test date	test date	test date	\N	\N	142	\N	\N	\N	1970-01-01 01:00:00.339+01
delivery136	datetest	another date test	test	\N	\N	143	\N	\N	\N	1970-01-01 01:00:00.94+01
delivery137	bbbbbbbbaAAA	sdfdsf	aaaa	\N	\N	144	\N	\N	\N	2013-04-19 01:35:18.452+01
delivery138	cucucu	CUCUCUC	gigigi	\N	\N	145	\N	\N	\N	\N
delivery139	TEEEEEEEEEST	TEEEEEEEST	TEEEEEEEEEST	\N	\N	146	\N	\N	\N	\N
delivery140	teeeeeeeeeeeeeeeeeeeest	teeeeeeeeeeeeeeeeeeest	teeeeeeeeeeeeeeeeeeeest	\N	\N	147	\N	\N	\N	\N
85	CICCIO	nicoletto@	\N	\N	\N	99	\N	\N	\N	\N
delivery141	aaaaaa	aaa	aa	\N	\N	148	\N	\N	\N	\N
delivery142	AAAAAAAAAAAAAAAAAAAAAAAA	AAAAAAAAA	AAAAAAAAAAAAa	\N	\N	149	\N	\N	\N	\N
delivery143	BBBBBBBBBBBB	BBBBBBBB	B	\N	\N	150	\N	\N	\N	\N
delivery144	CCCCCCCCCCC	CCCCCCCCCCC	\N	\N	\N	151	\N	\N	\N	\N
delivery145	GIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIINO	GIIIIIIIIINO	GIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIINO	\N	\N	152	\N	\N	\N	\N
delivery146	CHECCO	CHECCO	CHECC	\N	\N	153	\N	\N	\N	\N
94	TEST2	FROOOOOOOOOM	FRIENDLY NAME	\N	\N	108	\N	\N	\N	\N
104	gino		fffffffffff	\N	\N	135	\N	\N	\N	\N
delivery1	test delivery	CAAAAAAAAAAAALLL	CAAAAAAAAAAAAAAAAALLL	\N	lsdksdf	19	\N	\N	\N	\N
82	CICCIO	CIICCIIIIIIIO	\N	\N	\N	96	\N	\N	\N	\N
83	CICCIO	nicoYUUUUUUUUUU	\N	\N	\N	97	\N	\N	\N	\N
84	CICCIO	nicolettoUCCCIUCCI	\N	\N	\N	98	\N	\N	\N	\N
delivery147	TEEEEEEEEEEEEESTTTTTTTTTAAAAAAAAAAA	aaaaaaaaaaaaTEEEEEEEEEST	\N	\N	\N	154	\N	\N	\N	\N
86	CICCIOAAAAAAAAAAAAAAA	nicoletto@cicciAAAAAAAAAAAAAAAAAA	\N	\N	\N	100	\N	\N	\N	\N
delivery148	HHHHHHHHHH	hhhhhhhhhhhh	HHHHHHHHH	\N	\N	155	\N	\N	\N	\N
\.


--
-- Name: delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('delivery_id_seq', 155, true);


--
-- Name: delivery_userdef; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('delivery_userdef', 148, true);


--
-- Data for Name: navtree; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY navtree (id, parent_id, userdef_id, name, acl, icon_url, weight, view) FROM stdin;
0	\N	root_node	Mailcrunch	\N	\N	\N	\N
3	0	recipients_node	Recipients	\N	\N	100	\N
2	0	deilvery_node	Deliveries	\N	\N	101	\N
4	2	delivery_test_node	List	\N	\N	100	delivery-list
6	3	recipients_list_node	List	\N	\N	101	recipient-list
\.


--
-- Name: navtree_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('navtree_id_seq', 6, true);


--
-- Data for Name: operator; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY operator (id, username, password, last_modified_date, creation_date, acl) FROM stdin;
\.


--
-- Name: operators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('operators_id_seq', 1, false);


--
-- Name: pk; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('pk', 1, false);


--
-- Data for Name: recipient; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY recipient (id, lastname, firstname, email, landline, mobile, country_iso, address1, address2, city, region, state, zip_postcode, creation_date, last_modified_date, created_by, modified_by) FROM stdin;
\.


--
-- Name: recipient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('recipient_id_seq', 1, false);


--
-- Name: delivery_id; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY delivery
    ADD CONSTRAINT delivery_id PRIMARY KEY (id);


--
-- Name: navtree_pk; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY navtree
    ADD CONSTRAINT navtree_pk PRIMARY KEY (id);


--
-- Name: operators_pk; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY operator
    ADD CONSTRAINT operators_pk PRIMARY KEY (id);


--
-- Name: recipient_pk; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY recipient
    ADD CONSTRAINT recipient_pk PRIMARY KEY (id);


--
-- Name: userdef_id_idx; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY delivery
    ADD CONSTRAINT userdef_id_idx UNIQUE (userdef_id);


--
-- Name: delivery_created_by; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY delivery
    ADD CONSTRAINT delivery_created_by FOREIGN KEY (modified_by) REFERENCES operator(id);


--
-- Name: delivery_modified_by; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY delivery
    ADD CONSTRAINT delivery_modified_by FOREIGN KEY (modified_by) REFERENCES operator(id);


--
-- Name: parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY navtree
    ADD CONSTRAINT parent_fk FOREIGN KEY (parent_id) REFERENCES navtree(id);


--
-- Name: recipient_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY recipient
    ADD CONSTRAINT recipient_created_by_fk FOREIGN KEY (created_by) REFERENCES operator(id);


--
-- Name: recipient_modified_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY recipient
    ADD CONSTRAINT recipient_modified_by_fk FOREIGN KEY (modified_by) REFERENCES operator(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: pk; Type: ACL; Schema: public; Owner: mailcrunch
--

REVOKE ALL ON SEQUENCE pk FROM PUBLIC;
REVOKE ALL ON SEQUENCE pk FROM mailcrunch;
GRANT ALL ON SEQUENCE pk TO mailcrunch;


--
-- PostgreSQL database dump complete
--

