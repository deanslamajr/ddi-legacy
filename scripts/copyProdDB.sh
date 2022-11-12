#!/bin/bash

pg_dump --create --clean -h 34.66.222.174 -O -U postgres postgres > ddi_prod_backup.dump

psql -f ddi_prod_backup.dump -h localhost -U user postgres