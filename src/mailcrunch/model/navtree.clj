(ns mailcrunch.model.navtree
  (:use [korma.core :only [exec-raw defentity]])
  (:require [clojure.zip :as zip]))

(defentity navtree)

(defrecord Tree [id parent_id userdef_id children icon_url])

(defn is-parent
"Determines whether curr-node is the parent of node."
  [curr-node node]
  (= (:parent_id node) (:id curr-node)))

(defn is-child
"Determines whether node is or can be a child of curr-node"
[{:keys [id parent_id] :as node} curr-node]
(println "\nbvisChild " node " -> " curr-node)
  (and
   (= parent_id (:id curr-node) )
   (not (empty? (seq (filter #(= id (:id %))   (:children curr-node)))))))

(defn add-node [root new-node]
  (if (is-child new-node root)
    (do
      (println "Yes.. is child")
      (assoc-in root [:children] (conj (:children root) new-node)))
    (let [buf-children (:children root)
          new-children (for [child buf-children]
                         (add-node child new-node))]
      (assoc-in root [:children] new-children))))


(defn- map-to-tree
  "Transform the navigation map into a parent-to-child tree so that for each node we store a lazyseq of children nodes."
  [flat-tree]
  (let [res-tree (reduce add-node {} flat-tree)]
    (println res-tree)))

(defn get-navtree []
  (map-to-tree
   (exec-raw
    ["WITH RECURSIVE root(id, parent_id, label) AS (
        SELECT id, parent_id, label FROM navtree WHERE parent_id IS NULL
        UNION ALL
        SELECT n.id, n.parent_id, n.label
        FROM root r, navtree n
        WHERE n.parent_id = r.id)
      SELECT * FROM root;"] :results))
  {:ok "CIAO"})
