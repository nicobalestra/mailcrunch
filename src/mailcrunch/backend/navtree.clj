(ns mailcrunch.backend.navtree
  (:use  [korma.core :only [exec-raw defentity]]))

(defentity navtree)

(defn get-tree []
   (exec-raw
                ["WITH RECURSIVE root(id, parent_id, name, icon_url, weight,view) AS (
                  SELECT id, parent_id, name, icon_url, weight,view FROM navtree WHERE parent_id IS NULL
                  UNION ALL
                  SELECT n.id, n.parent_id, n.name, n.icon_url, n.weight,n.view
                  FROM root r, navtree n
                  WHERE n.parent_id = r.id)
                  SELECT * FROM root;"] :results))
