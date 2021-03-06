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
-- Name: delivery_job; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE delivery_job (
    id integer NOT NULL,
    delivery_id bigint,
    recipient_id bigint,
    delivery_status integer
);


ALTER TABLE public.delivery_job OWNER TO mailcrunch;

--
-- Name: delivery_job_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE delivery_job_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_job_id_seq OWNER TO mailcrunch;

--
-- Name: delivery_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailcrunch
--

ALTER SEQUENCE delivery_job_id_seq OWNED BY delivery_job.id;


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
-- Name: lists; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE lists (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    query text,
    entity character varying(100),
    userdef_id character varying(255)
);


ALTER TABLE public.lists OWNER TO mailcrunch;

--
-- Name: lists_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lists_id_seq OWNER TO mailcrunch;

--
-- Name: lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailcrunch
--

ALTER SEQUENCE lists_id_seq OWNED BY lists.id;


--
-- Name: lists_userdef; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE lists_userdef
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lists_userdef OWNER TO mailcrunch;

--
-- Name: mailcrunch_entities; Type: TABLE; Schema: public; Owner: mailcrunch; Tablespace: 
--

CREATE TABLE mailcrunch_entities (
    table_name character varying,
    id integer NOT NULL
);


ALTER TABLE public.mailcrunch_entities OWNER TO mailcrunch;

--
-- Name: mailcrunch-entities_id_seq; Type: SEQUENCE; Schema: public; Owner: mailcrunch
--

CREATE SEQUENCE "mailcrunch-entities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."mailcrunch-entities_id_seq" OWNER TO mailcrunch;

--
-- Name: mailcrunch-entities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mailcrunch
--

ALTER SEQUENCE "mailcrunch-entities_id_seq" OWNED BY mailcrunch_entities.id;


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

ALTER TABLE ONLY delivery_job ALTER COLUMN id SET DEFAULT nextval('delivery_job_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY lists ALTER COLUMN id SET DEFAULT nextval('lists_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY mailcrunch_entities ALTER COLUMN id SET DEFAULT nextval('"mailcrunch-entities_id_seq"'::regclass);


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
97	TEST2	nicobalestra@gmail.com	\N	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><title></title><meta http-equiv="Content-type" content="text/html; charset=UTF-8" /><style type="text/css">p { margin:0px; padding:0px; }</style></head><body style='background-color:rgba(0, 0, 0, 0);background-image:none;background-repeat:repeat;background-position:0% 0%;font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;font-size:16px;margin-top:0px;margin-bottom:0px;margin-left:0px;margin-right:0px;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:5px;'><p><span style="font-family:Verdana;"><font size="4">Let's put something here</font></span></p></body></html>	\N	111	\N	\N	\N	\N
\.


--
-- Name: delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('delivery_id_seq', 157, true);


--
-- Data for Name: delivery_job; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY delivery_job (id, delivery_id, recipient_id, delivery_status) FROM stdin;
\.


--
-- Name: delivery_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('delivery_job_id_seq', 1, false);


--
-- Name: delivery_userdef; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('delivery_userdef', 150, true);


--
-- Data for Name: lists; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY lists (id, name, query, entity, userdef_id) FROM stdin;
\.


--
-- Name: lists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('lists_id_seq', 1, true);


--
-- Name: lists_userdef; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('lists_userdef', 2, true);


--
-- Name: mailcrunch-entities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('"mailcrunch-entities_id_seq"', 2, true);


--
-- Data for Name: mailcrunch_entities; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY mailcrunch_entities (table_name, id) FROM stdin;
delivery	1
recipient	2
\.


--
-- Data for Name: navtree; Type: TABLE DATA; Schema: public; Owner: mailcrunch
--

COPY navtree (id, parent_id, userdef_id, name, acl, icon_url, weight, view) FROM stdin;
0	\N	root_node	Mailcrunch	\N	\N	\N	\N
3	0	recipients_node	Recipients	\N	\N	100	\N
2	0	deilvery_node	Deliveries	\N	\N	101	\N
4	2	delivery_test_node	List	\N	\N	100	delivery-list
6	3	recipients_list_node	All	\N	\N	101	recipient-list
7	0	recipients_list_queries_node	Lists	\N	\N	100	list-list
\.


--
-- Name: navtree_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mailcrunch
--

SELECT pg_catalog.setval('navtree_id_seq', 7, true);


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
-- Name: delivery_schedule_pk; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY delivery_job
    ADD CONSTRAINT delivery_schedule_pk PRIMARY KEY (id);


--
-- Name: lists_pk; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY lists
    ADD CONSTRAINT lists_pk PRIMARY KEY (id);


--
-- Name: mailcrunch-entities-pk; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY mailcrunch_entities
    ADD CONSTRAINT "mailcrunch-entities-pk" PRIMARY KEY (id);


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
-- Name: userdef_id_lists; Type: CONSTRAINT; Schema: public; Owner: mailcrunch; Tablespace: 
--

ALTER TABLE ONLY lists
    ADD CONSTRAINT userdef_id_lists UNIQUE (userdef_id);


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
-- Name: delivery_schedule_delivery_fk; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY delivery_job
    ADD CONSTRAINT delivery_schedule_delivery_fk FOREIGN KEY (delivery_id) REFERENCES delivery(id);


--
-- Name: delivery_schedule_recipient_fk; Type: FK CONSTRAINT; Schema: public; Owner: mailcrunch
--

ALTER TABLE ONLY delivery_job
    ADD CONSTRAINT delivery_schedule_recipient_fk FOREIGN KEY (recipient_id) REFERENCES recipient(id);


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

