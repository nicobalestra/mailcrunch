(ns mailcrunch.backend.mail
	(:require [mailcrunch.backend.delivery :as db]
						[postal.core :as p]))
(def encoding "UTF-8")

(def build-type [type]
	(str type "; charset=" encoding))

(defn send-delivery [id]
	(let [delivery (first (db/get-deliveries {:id id}))
				email  {:from (:from_email_address delivery)
  							:to ["nicobalestra@gmail.com"]
  							:subject (:subject delivery)
  							:body [{:type (build-type "text/html")
											  :content (:body_html delivery)}]
  							:X-tra "test extra"
  						 }]
		(p/send-message email)
		(db/update-delivery {:id id :sent true})
		))