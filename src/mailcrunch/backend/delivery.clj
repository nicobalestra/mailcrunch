(ns mailcrunch.backend.delivery
  (:require [mailcrunch.backend.db :as db]
            [korma.core :as kc]
            ))

(kc/defentity delivery)

(defn get-all [& filter]
  (kc/select delivery))

(defn count-delivery []
   (kc/select (db/q-number-of delivery)))


