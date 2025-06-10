CREATE OR REPLACE FUNCTION get_relatos_por_localidade(municipio_id uuid)
RETURNS TABLE(localidade text, total_relatos integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.nome,
        COUNT(r.id) AS total_relatos
    FROM 
        localidades l
    LEFT JOIN 
        relatos r ON r.id_localidade = l.id
    WHERE 
        l.id_municipio = municipio_id
    GROUP BY 
        l.id, l.nome
    ORDER BY 
        total_relatos DESC;
END;
$$;
