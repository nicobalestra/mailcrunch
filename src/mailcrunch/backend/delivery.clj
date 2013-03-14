(ns mailcrunch.backend.delivery
  (:require [mailcrunch.backend.db :as db]
            [korma.core :as kc]))

(kc/defentity delivery)

(defn get-deliveries [ & query]
  (if (empty? query)
    (kc/select delivery query)
    (kc/select delivery)))

(defn count-delivery [ & query]
  (if (empty? query)
     (kc/select (db/q-number-of delivery query))
     (kc/select (db/q-number-of delivery))))
  




