(ns mailcrunch.backend.delivery
  (:require [mailcrunch.backend.db :as db]
            [mailcrunch.backend.triggers :as triggers]
            [korma.core :as kc]
            [mailcrunch.engine.email :as email]
            [clojure.pprint :as pp]))

(kc/defentity ent-delivery
  (kc/table :delivery)
  (triggers/prepare-fns))

(defn get-deliveries
  ([] (kc/select ent-delivery))
  ([the-query] (kc/select ent-delivery
                          (kc/where the-query))))

(defn count
  ([] (kc/select (db/q-number-of ent-delivery)))
  ([query] (kc/select (db/q-number-of ent-delivery query))))

(defn update-delivery [delivery]
  (kc/update ent-delivery
             (kc/set-fields delivery)
             (kc/where {:id (delivery :id)})))

(defn- insert-delivery [delivery]
  (kc/insert ent-delivery
             (kc/values delivery)))

(defn delete-delivery [id]
  (kc/delete ent-delivery
      (kc/where {:id id})))

(defn save-delivery [delivery]
        (print "Delivery: ")
        (pp/pprint delivery)
        (if (delivery :id)
                (update-delivery delivery)
                (insert-delivery delivery)))


(def encoding "UTF-8")

(defn build-type [type]
   (str type "; charset=" encoding))


(defn- subject [delivery]
  (assoc delivery :subject (:subject delivery)))

(defn- body-html [delivery]
  delivery)

(defn- body-txt [delivery]
  delivery)

(defn build-email [delivery-id]
  (let [delivery (get-deliveries {:id delivery-id})
        email  {:from (:from_email_address delivery)
                :to (vec (:to delivery))
                :subject (:subject delivery)
                :body [{:type (build-type "text/html")
                        :content (:body_html delivery)}]
                :X-tra "test extra"
                }]
    ))

(defn send-delivery [delivery-id]
  (let [delivery (->  (get-deliveries {:id delivery-id})
                      (subject)
                      (body-html)
                      (body-txt))
        ]
    (email/kick-off-delivery delivery)))
