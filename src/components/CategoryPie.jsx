/*
 * CategoryPie.jsx
 *
 * The pie chart itself, given the { name, value, color } rows built by
 * the CategoryPieChart screen. One coloured slice per category.
 */

// React and the recharts pie primitives.
import React from 'react';
import {
    Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip
} from 'recharts';

// Chart: the category breakdown as a labelled pie.
export default function CategoryPie(props) {
    // "data" is the array of slices; each has a name, value and colour.
    const { data } = props;
    return (
        <ResponsiveContainer width="100%" height={360}>
            <PieChart>
                {/* The pie, labelled "category: amount" on each slice. */}
                <Pie
                    data={data} dataKey="value" nameKey="name"
                    outerRadius={130}
                    label={entry => entry.name + ': ' + entry.value}
                >
                    {/* One <Cell> gives its own colour to each slice. */}
                    {data.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Pie>
                {/* Hover tooltip and the category legend. */}
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
